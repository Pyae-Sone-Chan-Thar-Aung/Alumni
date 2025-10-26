import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUniversity } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin-dashboard' : '/alumni-dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Login attempt for:', formData.email);

      // 1) Attempt Supabase authentication first
      const { data: auth, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('❌ Auth error:', signInError);
        toast.error('Invalid email or password. Please check your credentials.');
        return;
      }

      console.log('✅ Auth successful');
      const supaUser = auth.user;

      // Helper: move uploaded image from temp/<file> to <userId>/<file>
      const moveImageFromTempToUser = async (userId, imageUrl) => {
        try {
          if (!imageUrl || !userId) return { publicUrl: imageUrl };
          const marker = '/object/public/alumni-profiles/';
          const idx = imageUrl.indexOf(marker);
          if (idx === -1) return { publicUrl: imageUrl };
          const oldPath = imageUrl.substring(idx + marker.length);
          if (!oldPath.startsWith('temp/')) return { publicUrl: imageUrl };
          const fileName = oldPath.split('/').pop();
          const newPath = `${userId}/${fileName}`;
          const { error: copyErr } = await supabase.storage.from('alumni-profiles').copy(oldPath, newPath);
          if (copyErr) throw copyErr;
          await supabase.storage.from('alumni-profiles').remove([oldPath]).catch(() => {});
          const { data: { publicUrl } } = supabase.storage.from('alumni-profiles').getPublicUrl(newPath);
          return { publicUrl };
        } catch (e) {
          console.warn('Image move failed on login:', e?.message);
          return { publicUrl: imageUrl };
        }
      };

      // 2) Ensure application user record exists (create if missing)
      let { data: userRecord, error: fetchUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supaUser.id)
        .maybeSingle();

      if (fetchUserError) {
        console.warn('⚠️ User fetch error (continuing):', fetchUserError);
      }

      if (!userRecord) {
        console.log('🆕 No application user record found. Creating pending user...');
        const firstName = supaUser?.user_metadata?.first_name || null;
        const lastName = supaUser?.user_metadata?.last_name || null;

        const { data: insertedUser, error: insertUserError } = await supabase
          .from('users')
          .insert({
            id: supaUser.id,
            email: supaUser.email,
            first_name: firstName,
            last_name: lastName,
            role: 'alumni',
            approval_status: 'pending',
            is_verified: false,
            registration_date: new Date().toISOString()
          })
          .select('*')
          .single();

        if (insertUserError) {
          console.error('❌ Failed to create application user:', insertUserError);
          toast.error('Your account could not be initialized. Please contact support.');
          // Sign out to avoid partial sessions
          await supabase.auth.signOut();
          return;
        }
        userRecord = insertedUser;

        // Create a minimal profile record (optional)
        await supabase
          .from('user_profiles')
          .insert({
            user_id: supaUser.id,
            first_name: firstName,
            last_name: lastName,
            country: 'Philippines'
          })
          .select()
          .maybeSingle();
      }

      // 3) If there is an approved pending registration, auto-approve this user and import profile
      try {
        let { data: pending } = await supabase
          .from('pending_registrations')
          .select('*')
          .eq('email', supaUser.email)
          .maybeSingle();
        if (!pending) {
          const { data: pend2 } = await supabase
            .from('pending_registrations')
            .select('*')
            .ilike('email', supaUser.email)
            .maybeSingle();
          pending = pend2 || null;
        }
        if (pending && pending.status === 'approved' && userRecord.approval_status !== 'approved') {
          await supabase
            .from('users')
            .update({ approval_status: 'approved', is_verified: true, approved_at: new Date().toISOString() })
            .eq('id', userRecord.id);

          let imageUrl = pending.profile_image_url || null;
          if (imageUrl && imageUrl.includes('/temp/')) {
            const moved = await moveImageFromTempToUser(userRecord.id, imageUrl);
            imageUrl = moved.publicUrl;
          }

          await supabase
            .from('user_profiles')
            .upsert({
              user_id: userRecord.id,
              phone: pending.phone || null,
              course: pending.course || null,
              batch_year: pending.batch_year || null,
              graduation_year: pending.graduation_year || null,
              current_job: pending.current_job || null,
              company: pending.company || null,
              address: pending.address || null,
              city: pending.city || null,
              country: pending.country || 'Philippines',
              profile_image_url: imageUrl || null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          await supabase
            .from('pending_registrations')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', pending.id);

          userRecord.approval_status = 'approved';
        }
      } catch (e) {
        console.warn('Pending import skipped:', e?.message);
      }

      // 4) Load profile (optional)
      let profile = null;
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userRecord.id)
          .maybeSingle();
        profile = profileData || null;
      } catch (profileError) {
        console.warn('⚠️ Could not load profile:', profileError);
      }

      // 4b) If profile missing or mostly empty, import from pending_registrations now
      try {
        const mostlyEmpty = !profile || (
          !profile.course && !profile.batch_year && !profile.graduation_year &&
          !profile.phone && !profile.current_job && !profile.company &&
          !profile.address && !profile.city && !profile.country && !profile.profile_image_url
        );
        if (mostlyEmpty) {
          let { data: pending } = await supabase
            .from('pending_registrations')
            .select('*')
            .eq('email', supaUser.email)
            .maybeSingle();
          if (!pending) {
            const { data: pend2 } = await supabase
              .from('pending_registrations')
              .select('*')
              .ilike('email', supaUser.email)
              .maybeSingle();
            pending = pend2 || null;
          }
          if (pending) {
            let imageUrl = pending.profile_image_url || null;
            if (imageUrl && imageUrl.includes('/temp/')) {
              const moved = await moveImageFromTempToUser(userRecord.id, imageUrl);
              imageUrl = moved.publicUrl;
            }
            const { data: upserted, error: profErr } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: userRecord.id,
                phone: pending.phone || null,
                course: pending.course || null,
                batch_year: pending.batch_year || null,
                graduation_year: pending.graduation_year || null,
                current_job: pending.current_job || null,
                company: pending.company || null,
                address: pending.address || null,
                city: pending.city || null,
                country: pending.country || 'Philippines',
                profile_image_url: imageUrl || null,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' })
              .select()
              .maybeSingle();
            if (!profErr) {
              profile = upserted || profile;
            }
          }
        }
      } catch (e) {
        console.warn('Profile import after login skipped:', e?.message);
      }

      console.log('✅ User loaded:', {
        email: userRecord.email,
        role: userRecord.role,
        approval_status: userRecord.approval_status
      });

      // 4) Enforce approval gating after we have an authenticated session
      if (userRecord.approval_status === 'pending') {
        console.warn('⚠️ Account pending approval');
        toast.error('Your account is pending admin approval. You will be notified once approved.');
        await supabase.auth.signOut();
        return;
      }

      if (userRecord.approval_status === 'rejected') {
        console.warn('⚠️ Account rejected');
        toast.error('Your registration has been rejected. Please contact the administrator.');
        await supabase.auth.signOut();
        return;
      }

      if (userRecord.approval_status !== 'approved') {
        console.warn('⚠️ Account not approved:', userRecord.approval_status);
        toast.error('Your account is not approved for login. Please contact the administrator.');
        await supabase.auth.signOut();
        return;
      }

      console.log('✅ Approval status check passed');

      // 5) Build app user object
      const userName = profile && profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : userRecord.first_name && userRecord.last_name
          ? `${userRecord.first_name} ${userRecord.last_name}`.trim()
          : userRecord.email.split('@')[0];

      const appUser = {
        id: userRecord.id,
        name: userName,
        email: userRecord.email,
        role: userRecord.role,
        approval_status: userRecord.approval_status,
        profile: profile || null
      };

      // 6) Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userRecord.id);

      // 7) Persist session in app context
      login(appUser, auth.session?.access_token || '');
      toast.success(`Welcome back, ${userName}!`);

      // Navigate based on role
      if (appUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/alumni-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show loading
  if (isAuthenticated) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-header">
            <div className="logo-section">

              <div className="brand-text">
                <h3 className="brand-title">Welcome Home UICian!</h3>
                <p className="brand-subtitle">CCS Alumni Portal System</p>
              </div>
            </div>
            <p className="welcome-text">Sign in to connect with your Alma Mater and fellow alumni.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="your.email@uic.edu.ph"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock /> Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Need help signing in?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              New to UIC Alumni Portal?{' '}
              <Link to="/register" className="register-link">
                Create your account
              </Link>
            </p>
            <p className="help-text">
              Need assistance? Contact the Alumni Office at{' '}
              <a href="mailto:alumni@uic.edu.ph" className="contact-link">
                alumni@uic.edu.ph
              </a>
            </p>
          </div>

          <div className="info-section">
            <div className="info-card">
              <strong>Note:</strong> New registrations require admin approval before login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 