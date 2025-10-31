import React, { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaListOl, FaPlus, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminTracerStudy.css';

const questionTypes = ['text','textarea','select','radio','checkbox','number','date','boolean'];

const AdminTracerBuilder = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [surveyForm, setSurveyForm] = useState({ name: '', description: '' });
  const [questionForm, setQuestionForm] = useState({ question_text: '', question_type: 'text', is_required: false, section: '', options: '' });

  const canManage = user && (user.role === 'admin');

  useEffect(() => { fetchSurveys(); }, []);

  useEffect(() => { if (selectedSurvey) fetchQuestions(selectedSurvey.id); }, [selectedSurvey]);

  const fetchSurveys = async () => {
    const { data, error } = await supabase.from('tracer_surveys').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (error) toast.error('Failed to load surveys');
    setSurveys(data || []);
  };

  const fetchQuestions = async (surveyId) => {
    const { data, error } = await supabase.from('tracer_survey_questions').select('*').eq('survey_id', surveyId).order('display_order', { ascending: true });
    if (error) toast.error('Failed to load questions');
    setQuestions(data || []);
  };

  const createSurvey = async () => {
    if (!surveyForm.name) return toast.warn('Survey name is required');
    const { error } = await supabase.from('tracer_surveys').insert({ name: surveyForm.name, description: surveyForm.description, created_by: user.id });
    if (error) return toast.error('Failed to create survey');
    setSurveyForm({ name: '', description: '' });
    toast.success('Survey created');
    fetchSurveys();
  };

  const addQuestion = async () => {
    if (!selectedSurvey) return toast.warn('Select a survey');
    if (!questionForm.question_text) return toast.warn('Question text is required');

    const optionsJson = parseOptions(questionForm.options);
    const { error } = await supabase.from('tracer_survey_questions').insert({
      survey_id: selectedSurvey.id,
      question_text: questionForm.question_text,
      question_type: questionForm.question_type,
      is_required: !!questionForm.is_required,
      section: questionForm.section || null,
      options: optionsJson,
      display_order: (questions.length + 1)
    });
    if (error) return toast.error('Failed to add question');
    toast.success('Question added');
    setQuestionForm({ question_text: '', question_type: 'text', is_required: false, section: '', options: '' });
    fetchQuestions(selectedSurvey.id);
  };

  const parseOptions = (txt) => {
    try {
      if (!txt) return null;
      // CSV or JSON array
      if (txt.trim().startsWith('[')) return JSON.parse(txt);
      return txt.split(',').map(s => s.trim()).filter(Boolean);
    } catch {
      return null;
    }
  };

  if (!canManage) {
    return <div className="admin-tracer"><p>You do not have permission to manage tracer surveys.</p></div>
  }

  return (
    <div className="admin-tracer">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1><FaListOl /> Tracer Study Builder</h1>
            <p>Create surveys and add questions without code changes</p>
          </div>
        </div>

        <div className="builder-grid">
          <div className="panel">
            <h3>Create Survey</h3>
            <input className="input" placeholder="Survey Name" value={surveyForm.name} onChange={(e) => setSurveyForm({ ...surveyForm, name: e.target.value })} />
            <textarea className="textarea" placeholder="Description" value={surveyForm.description} onChange={(e) => setSurveyForm({ ...surveyForm, description: e.target.value })} />
            <button className="btn btn-primary" onClick={createSurvey}><FaPlus /> Create Survey</button>
            <div className="list">
              {surveys.map(s => (
                <button key={s.id} className={`list-item ${selectedSurvey?.id === s.id ? 'active' : ''}`} onClick={() => setSelectedSurvey(s)}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Add Question {selectedSurvey ? `to ${selectedSurvey.name}` : ''}</h3>
            <input className="input" placeholder="Question Text" value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} />
            <div className="row">
              <label>Type
                <select className="select" value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                  {questionTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={!!questionForm.is_required} onChange={(e) => setQuestionForm({ ...questionForm, is_required: e.target.checked })} /> Required
              </label>
            </div>
            <input className="input" placeholder="Section (optional)" value={questionForm.section} onChange={(e) => setQuestionForm({ ...questionForm, section: e.target.value })} />
            <input className="input" placeholder="Options (comma-separated or JSON array)" value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} />
            <button className="btn" onClick={addQuestion}><FaSave /> Add Question</button>

            <div className="list">
              {questions.map(q => (
                <div key={q.id} className="list-item">
                  <div><strong>{q.display_order}. {q.question_text}</strong> <span className="muted">[{q.question_type}] {q.is_required ? '(required)' : ''}</span></div>
                  {q.section ? <div className="muted">Section: {q.section}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTracerBuilder;
