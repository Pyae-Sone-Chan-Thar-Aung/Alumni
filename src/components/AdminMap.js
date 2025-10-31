import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import supabase from '../config/supabaseClient';
import { geocodeWithDelay } from '../services/geocode';
import { FaMapMarkerAlt, FaSyncAlt, FaPlay, FaUser, FaBriefcase, FaMapPin, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminMap.css';

const AdminMap = () => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [clusterGroup, setClusterGroup] = useState(null);
  const [locations, setLocations] = useState([]);
  const [cityFilter, setCityFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [missingGeocode, setMissingGeocode] = useState([]);
  const [showGeocodePanel, setShowGeocodePanel] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const [validMarkerCount, setValidMarkerCount] = useState(0);

  useEffect(() => {
    const initMap = () => {
      if (mapInstance) return;
      const container = document.getElementById('alumni-map');
      if (!container) return;
      // Guard against React 18 strict mode double-mount: reset existing Leaflet instance if any
      if (container._leaflet_id) {
        try { container._leaflet_id = null; } catch {}
      }
      const map = L.map('alumni-map', { center: [7.0731, 125.6128], zoom: 6 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      setMapInstance(map);
      
      // Create marker cluster group with custom styling
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          
          // Create pin icon with number inside using same approach as individual markers
          const clusterIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="52">
                <path d="M12 0C7.589 0 4 3.589 4 8c0 6.5 8 16 8 16s8-9.5 8-16c0-4.411-3.589-8-8-8z" fill="#C21E56" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="8" r="5.5" fill="#ffffff"/>
                <text x="12" y="11" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#C21E56" text-anchor="middle">${count}</text>
              </svg>
            `),
            iconSize: [36, 52],
            iconAnchor: [18, 52],
            popupAnchor: [0, -52],
            className: 'marker-cluster-icon'
          });
          
          return clusterIcon;
        }
      });
      cluster.addTo(map);
      setClusterGroup(cluster);
    };
    initMap();
    return () => {
      try {
        if (clusterGroup) {
          clusterGroup.clearLayers();
        }
        if (mapInstance) {
          mapInstance.remove();
        }
      } catch {}
    };
  }, [mapInstance, clusterGroup]);

  useEffect(() => {
    loadAllLocations();
  }, []);

  const loadAllLocations = async () => {
    // Load locations with coordinates
    const { data, error } = await supabase.from('alumni_locations').select('*');
    if (error) {
      console.error('Error loading alumni locations:', error);
      toast.error('Failed to load locations');
    } else {
      console.log('Loaded locations:', data);
      setLocations(data || []);
    }

    // Load profiles missing geocoding
    const { data: missing } = await supabase
      .from('user_profiles')
      .select('user_id, address, city, province, country')
      .is('latitude', null)
      .not('address', 'is', null)
      .limit(200);
    setMissingGeocode(missing || []);
  };

  const runGeocode = async () => {
    if (!missingGeocode.length) {
      toast.info('No addresses need geocoding');
      return;
    }

    setGeocoding(true);
    setGeocodeProgress({ done: 0, total: missingGeocode.length });

    try {
      const addresses = missingGeocode.map(r => ({
        user_id: r.user_id,
        address: [r.address, r.city, r.province, r.country].filter(Boolean).join(', ')
      }));

      const BATCH_SIZE = 25;
      const DELAY_MS = 1200;

      for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const slice = addresses.slice(i, i + BATCH_SIZE);
        const results = await geocodeWithDelay(slice, DELAY_MS, (done) => {
          setGeocodeProgress({ done: i + done, total: addresses.length });
        });

        const updates = results
          .filter(r => r && typeof r.lat === 'number' && typeof r.lon === 'number')
          .map(r => ({
            user_id: r.user_id,
            latitude: r.lat,
            longitude: r.lon,
            location_updated_at: new Date().toISOString()
          }));

        for (const u of updates) {
          await supabase
            .from('user_profiles')
            .update({
              latitude: u.latitude,
              longitude: u.longitude,
              location_updated_at: u.location_updated_at
            })
            .eq('user_id', u.user_id);
        }
      }

      toast.success(`Geocoded ${missingGeocode.length} locations!`);
      setShowGeocodePanel(false);
      loadAllLocations();
    } catch (e) {
      toast.error('Geocoding failed. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  useEffect(() => {
    if (!mapInstance || !clusterGroup) return;

    clusterGroup.clearLayers();

    const filtered = locations.filter((loc) => {
      const cityOk = cityFilter === 'All' || (loc.city || '') === cityFilter;
      const companyOk = companyFilter === 'All' || (loc.current_company || '') === companyFilter;
      return cityOk && companyOk;
    });

    // Create custom pin icon
    const customIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
          <path d="M12 0C7.589 0 4 3.589 4 8c0 6.5 8 16 8 16s8-9.5 8-16c0-4.411-3.589-8-8-8z" fill="#e91e63" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="8" r="3" fill="#ffffff"/>
        </svg>
      `),
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48]
    });

    let validCount = 0;
    const validLocations = [];
    
    filtered.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn('Invalid coordinates for:', loc.first_name, loc.last_name, '- skipping');
        return;
      }
      
      validLocations.push([lat, lng]);
      console.log('Adding marker at:', lat, lng, 'for:', loc.first_name, loc.last_name);
      
      const marker = L.marker([lat, lng], { icon: customIcon });
      
      // Create user-friendly popup
      const fullName = `${loc.first_name || ''} ${loc.last_name || ''}`.trim();
      const jobInfo = loc.current_job_title || loc.current_company 
        ? `${loc.current_job_title || 'Alumni'}${loc.current_company ? ' @ ' + loc.current_company : ''}`
        : 'Alumni';
      const locationInfo = [loc.city, loc.province, loc.country].filter(Boolean).join(', ') || 'Location not specified';
      
      marker.bindPopup(`
        <div style="
          font-family: 'Inter', 'Poppins', -apple-system, sans-serif;
          padding: 4px;
          min-width: 200px;
          max-width: 280px;
        ">
          <!-- Header with Avatar -->
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #E5E7EB;
          ">
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: linear-gradient(135deg, #C21E56, #E91E63);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 18px;
              flex-shrink: 0;
              box-shadow: 0 2px 8px rgba(194, 30, 86, 0.3);
            ">
              ${fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="
                font-size: 16px;
                font-weight: 600;
                color: #1F2937;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${fullName || 'Alumni'}
              </div>
              <div style="
                font-size: 12px;
                color: #6B7280;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${loc.email || ''}
              </div>
            </div>
          </div>
          
          <!-- Info Sections -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Job Info -->
            <div style="display: flex; align-items: start; gap: 10px;">
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: #EFF6FF;
                color: #3B82F6;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 14px;
              ">💼</div>
              <div style="flex: 1; padding-top: 2px;">
                <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 2px; font-weight: 500;">Employment</div>
                <div style="font-size: 13px; color: #374151; font-weight: 500; line-height: 1.3;">
                  ${jobInfo}
                </div>
              </div>
            </div>
            
            <!-- Location Info -->
            <div style="display: flex; align-items: start; gap: 10px;">
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: #FEF2F2;
                color: #EF4444;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 14px;
              ">📍</div>
              <div style="flex: 1; padding-top: 2px;">
                <div style="font-size: 11px; color: #9CA3AF; margin-bottom: 2px; font-weight: 500;">Location</div>
                <div style="font-size: 13px; color: #374151; font-weight: 500; line-height: 1.3;">
                  ${locationInfo}
                </div>
              </div>
            </div>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });
      
      clusterGroup.addLayer(marker);
      validCount++;
    });
    
    setValidMarkerCount(validCount);
    console.log('Total valid markers added:', validCount, 'out of', filtered.length);

    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(validLocations);
      try { 
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 }); 
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [locations, cityFilter, companyFilter, mapInstance, clusterGroup]);

  const cities = ['All', ...Array.from(new Set((locations || []).map(l => l.city).filter(Boolean))).sort()];
  const companies = ['All', ...Array.from(new Set((locations || []).map(l => l.current_company).filter(Boolean))).sort()];

  return (
    <div className="admin-map-section">
      <div className="map-controls">
        <div className="filters">
          <label>
            City
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} aria-label="Filter by city">
              {cities.map(c => (<option value={c} key={c}>{c}</option>))}
            </select>
          </label>
          <label>
            Company
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} aria-label="Filter by company">
              {companies.map(c => (<option value={c} key={c}>{c}</option>))}
            </select>
          </label>
        </div>
        <div className="geocode-actions">
          {missingGeocode.length > 0 && (
            <button 
              className="geocode-btn" 
              onClick={() => setShowGeocodePanel(!showGeocodePanel)}
              title={`${missingGeocode.length} addresses need geocoding`}
            >
              <FaMapMarkerAlt /> Geocode ({missingGeocode.length})
            </button>
          )}
          <button className="refresh-btn" onClick={loadAllLocations} title="Refresh locations">
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {showGeocodePanel && (
        <div className="geocode-panel">
          <div className="panel-header">
            <h4><FaMapMarkerAlt /> Geocode Missing Locations</h4>
            <p>{missingGeocode.length} alumni addresses without coordinates</p>
          </div>
          {geocoding ? (
            <div className="geocode-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(geocodeProgress.done / geocodeProgress.total) * 100}%` }}
                />
              </div>
              <p>Processing: {geocodeProgress.done} / {geocodeProgress.total}</p>
            </div>
          ) : (
            <div className="panel-actions">
              <button className="btn-geocode-start" onClick={runGeocode}>
                <FaPlay /> Start Geocoding
              </button>
              <button className="btn-geocode-cancel" onClick={() => setShowGeocodePanel(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="map-info">
        <span className="location-count">
          <FaMapMarkerAlt /> Showing {validMarkerCount} alumni on map
        </span>
        {missingGeocode.length > 0 && (
          <span className="missing-count">
            {missingGeocode.length} pending geocoding
          </span>
        )}
      </div>
      
      {/* Debug Info - Remove after testing */}
      {locations.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '8px', padding: '8px', background: '#F9FAFB', borderRadius: '6px' }}>
          <strong>Debug:</strong> First location: {locations[0]?.first_name} {locations[0]?.last_name} at 
          [{locations[0]?.latitude}, {locations[0]?.longitude}] - 
          City: {locations[0]?.city || 'N/A'}
        </div>
      )}

      <div id="alumni-map" ref={mapRef} />
    </div>
  );
};

export default AdminMap;
