-- Create user_management_view with correct column names based on actual schema
CREATE OR REPLACE VIEW user_management_view AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.approval_status,
  u.is_verified,
  u.registration_date,
  u.created_at as user_created_at,
  u.approved_at,
  COALESCE(p.phone, p.mobile) as phone,
  p.program as course,  -- 'program' in profiles maps to 'course' in view
  p.batch_year,
  p.graduation_year,
  p.current_job_title as current_job,  -- 'current_job_title' in profiles
  p.current_company as company,        -- 'current_company' in profiles  
  p.address,
  p.city,
  p.country,
  p.profile_image_url
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id;