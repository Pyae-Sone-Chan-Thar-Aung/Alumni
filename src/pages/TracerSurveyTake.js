import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

// Known analytics keys we can map to the legacy analytics table
const KNOWN_KEYS = new Set([
  'full_name','email','phone','address','sex','civil_status',
  'degree','major','graduation_year','honors',
  'employment_status','company_name','job_title','industry','work_location','monthly_salary','employment_type',
  'first_job_related','job_search_duration','job_search_method','started_job_search',
  'curriculum_helpful','important_skills','additional_training',
  'program_satisfaction','university_preparation','recommend_program','suggestions'
]);

const TracerSurveyTake = () => {
  const { user } = useAuth();
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // qid -> value
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !surveyId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: sData, error: sErr }, { data: qData, error: qErr }, { data: rData, error: rErr }] = await Promise.all([
          supabase.from('tracer_surveys').select('*').eq('id', surveyId).single(),
          supabase.from('tracer_survey_questions').select('*').eq('survey_id', surveyId).order('display_order', { ascending: true }),
          supabase.from('tracer_survey_responses').select('*').eq('survey_id', surveyId).eq('user_id', user.id).single()
        ]);
        if (sErr) throw sErr;
        if (qErr) throw qErr;
        setSurvey(sData);
        setQuestions(qData || []);
        if (rErr && rErr.code !== 'PGRST116') { // not-found is fine
          throw rErr;
        }
        if (rData?.responses) {
          setAnswers(rData.responses || {});
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, surveyId]);

  const onChange = (qid, qtype, value, opts = {}) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const validate = () => {
    const missing = [];
    for (const q of questions) {
      if (q.is_required) {
        const v = answers[q.id];
        if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0)) {
          missing.push(q.question_text);
        }
      }
    }
    if (missing.length) {
      toast.error(`Please answer required question(s): ${missing[0]}`);
      return false;
    }
    return true;
  };

  const normalizeForAnalytics = () => {
    // Build a flat map using question validation_rules.key if provided
    const fields = {};
    for (const q of questions) {
      const rule = (q.validation_rules || {});
      const key = rule.key;
      if (!key || !KNOWN_KEYS.has(key)) continue;
      let v = answers[q.id];
      if (v === undefined) continue;
      // Coercions
      if (key === 'graduation_year') {
        v = v ? parseInt(v, 10) : null;
      }
      if (key === 'first_job_related' || key === 'curriculum_helpful' || key === 'recommend_program') {
        if (typeof v === 'string') {
          if (v.toLowerCase() === 'true' || v.toLowerCase() === 'yes') v = true;
          else if (v.toLowerCase() === 'false' || v.toLowerCase() === 'no') v = false;
        }
      }
      // Arrays (checkbox) join to comma-separated for legacy table text fields
      if (Array.isArray(v)) {
        v = v.join(', ');
      }
      fields[key] = v === '' ? null : v;
    }
    return fields;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // 1) Save flexible responses JSON
      const payload = {
        survey_id: surveyId,
        user_id: user.id,
        responses: answers,
        updated_at: new Date().toISOString()
      };
      const { error: upErr } = await supabase
        .from('tracer_survey_responses')
        .upsert(payload, { onConflict: 'survey_id,user_id', returning: 'minimal' });
      if (upErr) throw upErr;

      // 2) Also map to legacy analytics table so existing dashboards work
      const fields = normalizeForAnalytics();
      if (Object.keys(fields).length > 0) {
        const submission = {
          user_id: user.id,
          ...fields,
          updated_at: new Date().toISOString()
        };
        const { error: legacyErr } = await supabase
          .from('tracer_study_responses')
          .upsert(submission, { onConflict: 'user_id', returning: 'minimal' });
        if (legacyErr) {
          console.warn('Legacy analytics upsert warning:', legacyErr);
        }
      }

      toast.success('Responses saved');
      navigate('/tracer-study');
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (q) => {
    const val = answers[q.id];
    const type = q.question_type;
    const opts = Array.isArray(q.options) ? q.options : (q.options?.options || q.options); // support stored json like {options:[...]}
    switch (type) {
      case 'text':
        return <input className="input" value={val || ''} onChange={e => onChange(q.id, type, e.target.value)} />;
      case 'textarea':
        return <textarea className="textarea" value={val || ''} onChange={e => onChange(q.id, type, e.target.value)} />;
      case 'number':
        return <input type="number" className="input" value={val || ''} onChange={e => onChange(q.id, type, e.target.value)} />;
      case 'date':
        return <input type="date" className="input" value={val || ''} onChange={e => onChange(q.id, type, e.target.value)} />;
      case 'boolean':
        return (
          <select className="select" value={val === true ? 'true' : val === false ? 'false' : ''} onChange={e => onChange(q.id, type, e.target.value)}>
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      case 'select':
        return (
          <select className="select" value={val || ''} onChange={e => onChange(q.id, type, e.target.value)}>
            <option value="">Select</option>
            {(opts || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div className="radio-group">
            {(opts || []).map((o, i) => (
              <label key={i} className="radio-label">
                <input type="radio" name={q.id} value={o} checked={val === o} onChange={(e) => onChange(q.id, type, o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="checkbox-group">
            {(opts || []).map((o, i) => {
              const arr = Array.isArray(val) ? val : [];
              const checked = arr.includes(o);
              return (
                <label key={i} className="checkbox">
                  <input type="checkbox" checked={checked} onChange={(e) => {
                    const next = new Set(arr);
                    if (e.target.checked) next.add(o); else next.delete(o);
                    onChange(q.id, type, Array.from(next));
                  }} />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        );
      default:
        return <input className="input" value={val || ''} onChange={e => onChange(q.id, 'text', e.target.value)} />;
    }
  };

  if (!user) return null;
  if (loading) return <LoadingSpinner size="large" message="Loading survey..." fullscreen />;

  return (
    <div className="tracer-study-container">
      <div className="tracer-study-header">
        <h2><b>{survey?.name || 'Tracer Study'}</b></h2>
        {survey?.description && <p>{survey.description}</p>}
      </div>

      <div className="tracer-study-form">
        <div className="form-content">
          {questions.map((q) => (
            <div key={q.id} className="form-group full-width" style={{ marginBottom: 16 }}>
              {q.section && <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>{q.section}</div>}
              <label style={{ fontWeight: 600 }}>
                {q.question_text} {q.is_required ? <span style={{ color: '#dc2626' }}>*</span> : null}
              </label>
              {renderInput(q)}
            </div>
          ))}
        </div>

        <div className="form-navigation">
          <button className="btn btn-outline" onClick={() => navigate('/tracer-study')} disabled={saving}>Cancel</button>
          <button className="btn btn-success" onClick={onSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Responses'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TracerSurveyTake;
