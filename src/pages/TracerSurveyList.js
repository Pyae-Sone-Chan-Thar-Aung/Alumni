import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import supabase from '../config/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const TracerSurveyList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [myResponses, setMyResponses] = useState({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data: surveysData, error: surveysErr } = await supabase
          .from('tracer_surveys')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (surveysErr) throw surveysErr;

        setSurveys(surveysData || []);

        if ((surveysData || []).length > 0) {
          const surveyIds = (surveysData || []).map(s => s.id);
          const { data: respData, error: respErr } = await supabase
            .from('tracer_survey_responses')
            .select('survey_id, updated_at')
            .eq('user_id', user.id)
            .in('survey_id', surveyIds);
          if (respErr) throw respErr;
          const map = {};
          (respData || []).forEach(r => { map[r.survey_id] = r; });
          setMyResponses(map);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;
  if (loading) return <LoadingSpinner size="large" message="Loading tracer surveys..." fullscreen />;

  return (
    <div className="tracer-study-container">
      <div className="tracer-study-header">
        <h2><b>Graduate Tracer Studies</b></h2>
        <p>Select a survey to take or update your response.</p>
      </div>

      <div className="surveys-list" style={{ display: 'grid', gap: 16 }}>
        {surveys.length === 0 && (
          <div className="empty-state">
            <FaClipboardList />
            <p>No active tracer surveys right now.</p>
          </div>
        )}
        {surveys.map(s => {
          const mine = myResponses[s.id];
          return (
            <div key={s.id} className="survey-card" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
              <h3 style={{ margin: 0 }}>{s.name}</h3>
              {s.description && <p style={{ marginTop: 8 }}>{s.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                {mine && (
                  <span className="badge" style={{ color: '#059669' }}>
                    <FaCheckCircle style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Submitted: {new Date(mine.updated_at || s.created_at).toLocaleDateString()}
                  </span>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/tracer-study/${s.id}`)}
                >
                  {mine ? 'Update Response' : 'Take Survey'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TracerSurveyList;
