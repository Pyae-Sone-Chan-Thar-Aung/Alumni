# Quick Deploy: Email Notifications

## Prerequisites
```powershell
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login
```

## Deployment Commands

### 1. Deploy the Edge Function
```powershell
# Navigate to project directory
cd "C:\Users\Admin\OneDrive - uic.edu.ph\Desktop\CCSAlumni"

# Deploy the function
supabase functions deploy send-email --project-ref gpsbydtilgoutlltyfvl
```

### 2. Set Environment Secrets

**Get your Resend API key first:**
- Sign up at https://resend.com
- Go to API Keys → Create API Key
- Copy the key (starts with `re_`)

**Then set the secrets:**
```powershell
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_your_actual_key_here --project-ref gpsbydtilgoutlltyfvl

# Set from email (use default for testing)
supabase secrets set FROM_EMAIL="CCS Alumni <onboarding@resend.dev>" --project-ref gpsbydtilgoutlltyfvl
```

### 3. Verify Deployment
```powershell
# Check function is deployed
supabase functions list --project-ref gpsbydtilgoutlltyfvl

# Check secrets are set
supabase secrets list --project-ref gpsbydtilgoutlltyfvl

# View function logs
supabase functions logs send-email --project-ref gpsbydtilgoutlltyfvl
```

## Test the Function

### Using PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM"
    "Content-Type" = "application/json"
}

$body = @{
    to = "your-email@example.com"
    subject = "Test Email from CCS Alumni Portal"
    html = "<h1>Test Email</h1><p>If you receive this, the email system is working!</p>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://gpsbydtilgoutlltyfvl.supabase.co/functions/v1/send-email" -Method POST -Headers $headers -Body $body
```

## Expected Response

**Success:**
```json
{
  "success": true,
  "data": {
    "id": "email-id-here"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Troubleshooting

### Function not found
```powershell
# Re-deploy
supabase functions deploy send-email --project-ref gpsbydtilgoutlltyfvl
```

### Missing secrets
```powershell
# List current secrets
supabase secrets list --project-ref gpsbydtilgoutlltyfvl

# Re-set if missing
supabase secrets set RESEND_API_KEY=re_your_key --project-ref gpsbydtilgoutlltyfvl
```

### Check logs for errors
```powershell
# Stream real-time logs
supabase functions logs send-email --project-ref gpsbydtilgoutlltyfvl --follow
```

## Files Created

✅ **Frontend:**
- `src/utils/emailService.js` - Email service utility
- `src/pages/AdminPendingRegistrations.js` - Updated with email integration

✅ **Backend:**
- `supabase/functions/send-email/index.ts` - Edge function

✅ **Documentation:**
- `EMAIL_SETUP_GUIDE.md` - Complete setup guide
- `DEPLOY_EMAIL_NOTIFICATIONS.md` - This file

## Next Steps

1. Deploy the function using commands above
2. Test with your email
3. Register a test user
4. Approve/reject and verify email is sent

## Notes

- Free tier: 100 emails/day, 3,000/month
- Edge function: 500,000 invocations/month free
- Emails send even if function fails (graceful degradation)
- Check spam folder if email not received
