import React, { useEffect, useMemo, useState } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { geocodeWithDelay } from '../services/geocode';
import { FaMapMarkerAlt, FaPlay, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminGeocode.css';

const BATCH_SIZE = 25;
const DELAY_MS = 1200; // Respectful delay per Nominatim usage

const AdminGeocode = () => {
  const { user } = useAuth();
  const canManage = user && (user.role === 'admin' || user.role === 'coordinator');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { if (canManage) loadRows(); }, [canManage]);

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, address, city, province, country, current_company, current_job_title')
      .is('latitude', null)
      .not('address', 'is', null)
      .limit(200);
    if (error) toast.error('Failed to load profiles');
    setRows(data || []);
    setLoading(false);
  };

  const addresses = useMemo(() => (rows || []).map(r => ({
    user_id: r.user_id,
    address: [r.address, r.city, r.province, r.country].filter(Boolean).join(', ')
  })), [rows]);

  const runGeocode = async () => {
    if (!addresses.length) return toast.info('No profiles needing geocoding.');
    setRunning(true);
    setProgress({ done: 0, total: addresses.length });

    try {
      for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const slice = addresses.slice(i, i + BATCH_SIZE);
        const results = await geocodeWithDelay(slice, DELAY_MS, (done) => setProgress({ done: (i + done), total: addresses.length }));
        const updates = results
          .filter(r => r && typeof r.lat === 'number' && typeof r.lon === 'number')
          .map(r => ({ user_id: r.user_id, latitude: r.lat, longitude: r.lon, location_updated_at: new Date().toISOString() }));
        for (const u of updates) {
          await supabase.from('user_profiles').update({
            latitude: u.latitude,
            longitude: u.longitude,
            location_updated_at: u.location_updated_at
          }).eq('user_id', u.user_id);
        }
      }
      toast.success('Geocoding complete');
      loadRows();
    } catch (e) {
      toast.error('Geocoding failed. Please try again later.');
    } finally {
      setRunning(false);
    }
  };

  if (!canManage) return <div className="admin-geocode"><p>You do not have permission to use this tool.</p></div>;

  return (
    <div className="admin-geocode">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1><FaMapMarkerAlt /> Geocode Alumni Locations</h1>
            <p>Populate latitude/longitude for alumni with addresses. Uses OpenStreetMap Nominatim and rate-limits requests.</p>
          </div>
          <div className="actions">
            <button className="btn" onClick={loadRows} disabled={loading || running}><FaSyncAlt /> Refresh</button>
            <button className="btn btn-primary" onClick={runGeocode} disabled={running || loading || !addresses.length}><FaPlay /> Start</button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="progress">
              <div>Pending: {addresses.length}</div>
              <div>Progress: {progress.done}/{progress.total}</div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {(rows || []).map((r) => (
                    <tr key={r.user_id}>
                      <td>{r.user_id}</td>
                      <td>{[r.address, r.city, r.province, r.country].filter(Boolean).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminGeocode;
