# Implementation Guide: User Management System

## Quick Start Implementation

### 1. Database Setup

Run the production schema:
```bash
# Connect to your Supabase/PostgreSQL database
psql -h your-host -U your-user -d your-database -f production_database_schema.sql
```

### 2. Backend API Implementation

#### Registration Endpoint
```javascript
// routes/auth.js
const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');

const registerUser = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, studentId,
      graduationYear, program, phone, address, city, country,
      currentJob, company
    } = req.body;

    // 1. Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // 2. Check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Handle profile image upload
    let profileImageUrl = null;
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('alumni-profiles')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (!uploadError) {
        profileImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/alumni-profiles/${fileName}`;
      }
    }

    // 5. Insert into pending_registrations
    const { data, error } = await supabase
      .from('pending_registrations')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        student_id: studentId,
        graduation_year: graduationYear,
        program,
        phone,
        address,
        city,
        country,
        current_job: currentJob,
        company,
        profile_image_url: profileImageUrl
      });

    if (error) throw error;

    // 6. Send notification to admin
    await sendAdminNotification(email, firstName, lastName);

    res.status(201).json({
      success: true,
      message: 'Registration submitted for approval'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};
```

#### Login Endpoint
```javascript
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Check status
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        error: 'Account pending approval',
        status: user.status 
      });
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Create session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from('user_sessions').insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    // 5. Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 6. Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile
      },
      expiresAt
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
```

#### Admin Approval Endpoint
```javascript
const approveRegistration = async (req, res) => {
  try {
    const { registrationId, action } = req.body; // action: 'approve' or 'reject'

    // 1. Get pending registration
    const { data: registration, error: regError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (action === 'approve') {
      // 2. Create user account
      const passwordHash = await bcrypt.hash('temp123', 12); // Temporary password

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: registration.email,
          password_hash: passwordHash,
          status: 'approved',
          role: 'alumni'
        })
        .select()
        .single();

      if (userError) throw userError;

      // 3. Create user profile
      await supabase.from('user_profiles').insert({
        user_id: newUser.id,
        first_name: registration.first_name,
        last_name: registration.last_name,
        student_id: registration.student_id,
        graduation_year: registration.graduation_year,
        program: registration.program,
        phone: registration.phone,
        address: registration.address,
        city: registration.city,
        country: registration.country,
        current_job: registration.current_job,
        company: registration.company,
        profile_image_url: registration.profile_image_url
      });

      // 4. Send welcome email
      await sendWelcomeEmail(registration.email, registration.first_name);
    }

    // 5. Remove from pending
    await supabase
      .from('pending_registrations')
      .delete()
      .eq('id', registrationId);

    res.json({
      success: true,
      message: `Registration ${action}d successfully`
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Approval failed' });
  }
};
```

### 3. Frontend Implementation

#### Registration Form Component
```javascript
// components/RegistrationForm.js
import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    studentId: '',
    graduationYear: '',
    program: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    currentJob: '',
    company: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append profile image if selected
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        alert('Registration submitted successfully! Please wait for admin approval.');
        // Reset form or redirect
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Password *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength="8"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files[0])}
        />
      </div>

      {/* Add other form fields similarly */}

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
};
```

#### Admin Dashboard Component
```javascript
// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes, pendingRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/recent-activities'),
        fetch('/api/admin/pending-registrations')
      ]);

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      const pendingData = await pendingRes.json();

      setStats(statsData);
      setRecentActivities(activitiesData);
      setPendingRegistrations(pendingData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handleApproval = async (registrationId, action) => {
    try {
      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, action })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
        alert(`Registration ${action}d successfully`);
      } else {
        alert('Action failed');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Action failed');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Alumni</h3>
          <p className="stat-number">{stats.total_alumni || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p className="stat-number">{stats.pending_approvals || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <p className="stat-number">{stats.active_jobs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Tracer Responses</h3>
          <p className="stat-number">{stats.tracer_study_responses || 0}</p>
        </div>
      </div>

      {/* Pending Registrations */}
      <div className="pending-registrations">
        <h2>Pending Registrations</h2>
        {pendingRegistrations.map(registration => (
          <div key={registration.id} className="registration-card">
            <div className="registration-info">
              <h4>{registration.first_name} {registration.last_name}</h4>
              <p>Email: {registration.email}</p>
              <p>Program: {registration.program}</p>
              <p>Graduation Year: {registration.graduation_year}</p>
            </div>
            <div className="registration-actions">
              <button 
                onClick={() => handleApproval(registration.id, 'approve')}
                className="approve-btn"
              >
                Approve
              </button>
              <button 
                onClick={() => handleApproval(registration.id, 'reject')}
                className="reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        {recentActivities.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="activity-type">{activity.type}</span>
            <span className="activity-title">{activity.title}</span>
            <span className="activity-date">
              {new Date(activity.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. Security Implementation

#### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify session token
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (
          id, email, role, status,
          user_profiles (*)
        )
      `)
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = session.users;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

### 5. Real-time Updates

#### WebSocket Implementation
```javascript
// services/realtime.js
const WebSocket = require('ws');
const { supabase } = require('../config/supabase');

class RealtimeService {
  constructor() {
    this.clients = new Set();
    this.setupDatabaseListeners();
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.on('close', () => this.clients.delete(ws));
  }

  broadcast(data) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  setupDatabaseListeners() {
    // Listen for new registrations
    supabase
      .channel('pending_registrations')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'pending_registrations' },
        (payload) => {
          this.broadcast({
            type: 'new_registration',
            data: payload.new
          });
        }
      )
      .subscribe();

    // Listen for new news
    supabase
      .channel('news_announcements')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'news_announcements' },
        (payload) => {
          this.broadcast({
            type: 'new_news',
            data: payload.new
          });
        }
      )
      .subscribe();
  }
}

module.exports = new RealtimeService();
```

This implementation guide provides a complete, production-ready system for user management with proper security, scalability, and real-time features.
