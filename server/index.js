// Simple Express server for admin operations using Supabase service role
// IMPORTANT: Do NOT expose the service role key to the browser.
// Configure env vars:
//  - SUPABASE_URL
//  - SUPABASE_SERVICE_ROLE_KEY
// Optional:
//  - PORT (default 8000)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: fs.existsSync(path.join(__dirname, '.env')) ? path.join(__dirname, '.env') : undefined });
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 8000;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase server configuration.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'uic-alumni-admin-api' });
});

// Approve a pending registration and create corresponding auth + DB records
app.post('/api/admin/approve-registration', async (req, res) => {
  try {
    const { registrationId } = req.body || {};
    if (!registrationId) {
      return res.status(400).json({ success: false, error: 'registrationId is required' });
    }

    // 1) Fetch pending registration
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (fetchError || !registration) {
      return res.status(404).json({ success: false, error: fetchError?.message || 'Registration not found' });
    }

    // 2) Create Supabase Auth user (requires service role)
    const tempPassword = 'TempPassword123!';
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: registration.email,
      password: tempPassword,
      email_confirm: true
    });

    if (authError) {
      return res.status(403).json({ success: false, error: authError.message });
    }

    const userId = authData.user.id;

    // 3) Insert into users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: registration.email,
        password_hash: 'supabase_auth_managed',
        role: 'alumni',
        status: 'approved',
        email_verified: true
      });
    if (userError) {
      return res.status(400).json({ success: false, error: userError.message });
    }

    // 4) Insert into user_profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
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

    if (profileError) {
      return res.status(400).json({ success: false, error: profileError.message });
    }

    // 5) Delete pending registration
    const { error: deleteError } = await supabase
      .from('pending_registrations')
      .delete()
      .eq('id', registrationId);

    if (deleteError) {
      return res.status(400).json({ success: false, error: deleteError.message });
    }

    return res.json({ success: true, userId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Admin API running on http://localhost:${PORT}`);
});
