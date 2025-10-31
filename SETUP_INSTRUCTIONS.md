# Setup Instructions for New Features

## Quick Start

### 1. Database Setup

Run the comprehensive database update script:

```bash
# In Supabase SQL Editor, execute:
database_updates_comprehensive.sql
```

This will:
- Add coordinator role
- Update job_opportunities table with submission workflow
- Create notifications system
- Create dynamic tracer study tables
- Add location tracking for maps
- Update RLS policies

### 2. Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `job-submissions`
3. Set as **Private** (not public)
4. Add storage policy:

```sql
-- Allow authenticated alumni to upload
CREATE POLICY "Alumni can upload job submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-submissions' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'alumni' 
    AND approval_status = 'approved'
  )
);
```

### 3. Update Existing Data

```sql
-- Set existing jobs to approved
UPDATE job_opportunities 
SET approval_status = 'approved' 
WHERE is_active = TRUE AND approval_status IS NULL;

-- Create test coordinator (optional)
UPDATE users 
SET role = 'coordinator' 
WHERE email = 'coordinator@example.com'; -- Replace with actual email
```

### 4. Frontend Updates

All frontend files have been updated:
- ✅ `src/pages/Register.js` - Updated registration form
- ✅ `src/components/JobSubmission.js` - New job submission component
- ✅ `src/pages/JobOpportunities.js` - Updated to use new submission
- ✅ `src/pages/AdminJobs.js` - Added approval workflow
- ✅ `src/pages/AdminDashboard.js` - Simplified dashboard

### 5. Role-Based Access

**Admin** (`role = 'admin'`):
- Full system access
- Can approve/reject registrations and job posts
- Can manage all content

**Coordinator** (`role = 'coordinator'`):
- Can manage jobs (post, approve, reject)
- Can post internal news
- Can message alumni
- Cannot manage users or system settings

**Alumni** (`role = 'alumni'`):
- Can submit jobs for review
- Can view approved jobs
- Can view internal news (when approved)
- Standard alumni features

## Testing Checklist

### Registration Form
- [ ] Register without student ID and batch year
- [ ] Select "Unemployed" and verify job/company fields hidden
- [ ] Select "Employed" and verify job/company fields visible
- [ ] Submit registration successfully

### Job Submission
- [ ] As alumni, click "Share Job" button
- [ ] Submit via form
- [ ] Submit via PDF upload
- [ ] Submit via image upload
- [ ] Verify submission appears in admin panel as "Pending Review"

### Admin Job Approval
- [ ] View pending job submissions
- [ ] Approve a job submission
- [ ] Reject a job submission with notes
- [ ] Verify approved jobs appear in public job listings
- [ ] Verify rejected jobs don't appear in public listings

### Coordinator Role
- [ ] Login as coordinator
- [ ] Verify can access job management
- [ ] Verify can post jobs directly
- [ ] Verify cannot access user management

### Dashboard
- [ ] Verify only "Total Alumni" stat card visible
- [ ] Verify pending accounts table below charts
- [ ] Verify pagination works for pending accounts
- [ ] Approve/reject users from table

### Notifications (Backend Ready)
- [ ] Verify notifications table created
- [ ] Register new user → check notification created
- [ ] Approve user → check notification created
- [ ] Approve job → check notification created

## Known Limitations

1. **Facebook Integration**: News+Gallery unified page needs Facebook API setup
2. **Email Notifications**: Requires Supabase Edge Function configuration
3. **Map Integration**: Needs Google Maps API key or OpenStreetMap setup
4. **Dynamic Tracer Study**: Admin interface not yet built (schema ready)
5. **Facial Recognition**: Requires feasibility study and security review

## Next Steps

1. Configure email notifications (Supabase Edge Functions)
2. Set up Facebook API for news/gallery feed
3. Integrate map API (Google Maps recommended)
4. Build dynamic tracer study admin interface
5. Add filter labels to all filter buttons
6. Research facial recognition feasibility

## Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for feature details
2. Review database schema in `database_updates_comprehensive.sql`
3. Check component files for implementation details

