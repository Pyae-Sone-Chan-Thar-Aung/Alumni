# Email Notification System Setup Guide

This guide will help you set up automated email notifications for user registration approvals and rejections.

## Overview

When an admin approves or rejects a user registration, the system will automatically:
1. ✅ Send a professional email to the user's registered email address
2. 📬 Create an in-app notification (if user exists in the system)
3. 🎨 Use beautifully styled HTML email templates
4. 🔐 Handle failures gracefully without blocking the approval process

## Implementation Status

✅ **Completed:**
- Email service utility (`src/utils/emailService.js`)
- Supabase Edge Function (`supabase/functions/send-email/index.ts`)
- HTML email templates for approval and rejection
- Integration with AdminPendingRegistrations component
- Error handling and logging

## Setup Instructions

### Step 1: Get a Resend API Key

1. Go to [resend.com](https://resend.com) and create a free account
2. Verify your email address
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the API key (starts with `re_`)

**Free tier includes:**
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small-scale deployments

### Step 2: Install Supabase CLI (if not already installed)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your Supabase account
supabase login

# Link to your project
supabase link --project-ref gpsbydtilgoutlltyfvl
```

### Step 3: Deploy the Edge Function

```bash
# Deploy the send-email function
supabase functions deploy send-email

# Set the required secrets
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FROM_EMAIL="CCS Alumni <noreply@yourdomain.com>"
```

**Note:** Replace `noreply@yourdomain.com` with your actual email. For testing, you can use the default Resend email: `onboarding@resend.dev`

### Step 4: Verify the Setup

1. **Test the Edge Function directly:**

```bash
# Using curl (PowerShell)
$headers = @{
    "Authorization" = "Bearer YOUR_SUPABASE_ANON_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    to = "your-test-email@example.com"
    subject = "Test Email"
    html = "<h1>Hello from CCS Alumni Portal!</h1>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://gpsbydtilgoutlltyfvl.supabase.co/functions/v1/send-email" -Method POST -Headers $headers -Body $body
```

2. **Test through the application:**
   - Register a new user account
   - Login as admin
   - Go to "Pending Registrations"
   - Approve or reject the registration
   - Check the user's email inbox

### Step 5: Customize Email Templates (Optional)

You can customize the email templates by editing `src/utils/emailService.js`:

**Approval Email:**
- Lines 22-73: HTML template for approval
- Modify colors, text, or add your logo

**Rejection Email:**
- Lines 105-167: HTML template for rejection
- Add specific rejection reasons or contact information

## Email Templates Preview

### Approval Email Features:
- ✅ Professional gradient header
- 🎉 Congratulatory message
- 📋 List of portal features
- 🔗 Direct login button
- 📧 Contact information

### Rejection Email Features:
- ⚠️ Polite rejection message
- 📝 Possible reasons for rejection
- 💡 Next steps guidance
- 🔗 Re-registration link
- 📧 Contact information

## Configuration Options

### Using a Different Email Provider

If you prefer to use **SendGrid** instead of Resend:

1. Update `supabase/functions/send-email/index.ts`:

```typescript
// Replace Resend API call with SendGrid
const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL },
    subject: subject,
    content: [{ type: 'text/html', value: html }]
  })
});
```

2. Update the secret:
```bash
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
```

### Custom Domain Email

To send emails from your own domain:

1. **Verify your domain with Resend:**
   - Go to Resend Dashboard → Domains
   - Add your domain
   - Add DNS records to your domain provider

2. **Update the FROM_EMAIL secret:**
```bash
supabase secrets set FROM_EMAIL="CCS Alumni <alumni@yourdomain.com>"
```

## Troubleshooting

### Edge Function not found
```bash
# Re-deploy the function
supabase functions deploy send-email
```

### Emails not being sent
1. Check if secrets are set:
```bash
supabase secrets list
```

2. Check function logs:
```bash
supabase functions logs send-email
```

3. Verify Resend API key is valid

### Email lands in spam
- Set up SPF, DKIM, and DMARC records
- Use a verified domain
- Avoid spam trigger words in subject/content

## Testing Checklist

- [ ] Edge function deploys successfully
- [ ] Secrets are configured correctly
- [ ] Test approval email is received
- [ ] Test rejection email is received
- [ ] Emails have correct formatting
- [ ] Links in emails work correctly
- [ ] In-app notifications are created
- [ ] Error handling works (function fails gracefully)

## Security Considerations

✅ **Current Implementation:**
- API keys stored as Supabase secrets (encrypted)
- Edge function has CORS protection
- Email content is sanitized
- User data is validated before sending

⚠️ **Best Practices:**
- Never expose API keys in client-side code
- Rate limit email sending to prevent abuse
- Log email attempts for audit purposes
- Monitor for bounced/failed emails

## Cost Estimation

**Resend Free Tier:**
- 100 emails/day = FREE
- 3,000 emails/month = FREE

**Resend Paid Plans (if needed):**
- $20/month = 50,000 emails
- $80/month = 100,000 emails

**Supabase Edge Functions:**
- 500,000 function invocations/month = FREE
- Additional invocations: $2 per million

For a small to medium alumni portal, the free tiers should be sufficient.

## Next Steps

1. ✅ Complete the setup steps above
2. 🧪 Test the email flow end-to-end
3. 🎨 Customize email templates to match your branding
4. 📊 Monitor email delivery and open rates
5. 🔔 Consider adding email notifications for other events:
   - Job posting approvals
   - News/announcement updates
   - Event invitations
   - Password resets

## Support

If you encounter any issues:
1. Check the console logs in the browser (F12)
2. Check Supabase function logs
3. Verify all environment variables are set
4. Test with a simple email first

---

**Questions?** Refer to:
- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- `docs/EMAIL_NOTIFICATIONS_SETUP.md` for alternative implementations
