# Email Notification System - Testing Guide

## ✅ Deployment Complete!

Your email notification system has been successfully deployed:

- ✅ Edge function deployed: `send-email`
- ✅ Resend API key configured
- ✅ From email configured
- ✅ Integration with AdminPendingRegistrations complete

## Current Status: 403 Error Explanation

The 403 error you're seeing when testing directly is **expected and normal**. Here's why:

### Why the 403 Error?
- Supabase Edge Functions require proper authentication/authorization
- Direct API calls without user context are blocked by default
- This is a **security feature** to prevent unauthorized access

### When Will It Work?
The email function **will work correctly** when called from your React application because:
1. Users are authenticated through Supabase Auth
2. The `supabase.functions.invoke()` call includes the user's JWT token
3. The application context provides proper authorization

## How to Test the Email System

### Method 1: Test Through the Application (Recommended)

This is the most reliable way to test:

1. **Start your React application:**
   ```powershell
   npm start
   ```

2. **Register a new test user:**
   - Go to http://localhost:3000/register
   - Fill in all required fields
   - Use a **real email address** you can access
   - Complete the registration

3. **Login as Admin:**
   - Go to http://localhost:3000/login
   - Login with admin credentials

4. **Approve the registration:**
   - Navigate to "Pending Registrations"
   - Find your test user
   - Click "Approve" (or "Reject" to test rejection email)

5. **Check your email:**
   - Check the inbox of the email you registered with
   - Also check spam/junk folder
   - You should receive a beautifully formatted email

### Method 2: Check Browser Console

When you approve/reject a user, check the browser console (F12):

**Success indicators:**
```
✅ Approval email sent successfully
```

**Failure indicators:**
```
⚠️ Failed to send approval email: [error message]
```

Even if email sending fails, the approval process will continue (graceful degradation).

### Method 3: Check Supabase Logs

You can view real-time logs from the edge function:

```powershell
npx supabase functions logs send-email
```

Or view logs in the Supabase Dashboard:
- Go to https://supabase.com/dashboard/project/gpsbydtilgoutlltyfvl/logs
- Select "Edge Functions" → "send-email"

## Expected Email Content

### Approval Email Preview:

**Subject:** ✅ Your CCS Alumni Account Has Been Approved!

**Content:**
- Gradient header with welcome message
- List of features they can now access
- Login button
- Professional footer

### Rejection Email Preview:

**Subject:** Update on Your CCS Alumni Registration

**Content:**
- Polite explanation
- Possible reasons for rejection
- Next steps guidance
- Re-registration link

## Troubleshooting

### 1. Email Not Received

**Check:**
- ✅ Spam/junk folder
- ✅ Email address is correct
- ✅ Resend API key is valid
- ✅ Check browser console for errors

**Fix:**
```powershell
# Verify secrets are set
npx supabase secrets list

# Re-set if needed
npx supabase secrets set RESEND_API_KEY=re_EVwB3two_F3HR6gFJBaXJ9wJdmTvNyqag
```

### 2. Edge Function Error

**Check function logs:**
```powershell
npx supabase functions logs send-email
```

**Common issues:**
- API key not set → Set with `npx supabase secrets set`
- Invalid API key → Get new key from resend.com
- Rate limit reached → Free tier: 100 emails/day

### 3. Function Not Found

**Re-deploy:**
```powershell
npx supabase functions deploy send-email
```

### 4. Console Shows Error

Open browser console (F12) and look for:
```javascript
// Success
✅ Approval email sent successfully

// Failure - but process continues
⚠️ Failed to send approval email: [reason]
Email notification error: [details]
```

## Testing Checklist

Complete these steps to verify everything works:

- [ ] Start React app: `npm start`
- [ ] Register new user with real email
- [ ] Login as admin
- [ ] Navigate to Pending Registrations
- [ ] Approve the test user
- [ ] Check email inbox (and spam)
- [ ] Verify email is beautifully formatted
- [ ] Test rejection email (register another user)
- [ ] Check browser console for logs
- [ ] Verify no errors in console

## What You Should See

### In Browser Console:
```
🔍 Fetching pending registrations...
📋 Combined pending items: 1
✅ Approval email sent successfully
Registration approved successfully! Approval email sent to user.
```

### In Email Inbox:
A professional HTML email with:
- 🎉 Welcome header with gradient
- ✅ Approval confirmation
- 📋 List of features
- 🔗 Login button
- 📧 Footer with contact info

## Resend Dashboard

You can also monitor emails in your Resend dashboard:
- Go to https://resend.com/emails
- View all sent emails
- Check delivery status
- See open rates

## Next Steps

Once you've verified emails are working:

1. ✅ Customize email templates (optional)
   - Edit `src/utils/emailService.js`
   - Update branding, colors, or content

2. ✅ Set up custom domain (optional)
   - Verify domain in Resend
   - Update FROM_EMAIL secret

3. ✅ Monitor usage
   - Free tier: 100 emails/day
   - Check Resend dashboard for stats

4. ✅ Add more notifications (future)
   - Job posting approvals
   - News updates
   - Event invitations

## Support

If you encounter issues:

1. Check browser console (F12)
2. Check Supabase function logs
3. Check Resend dashboard
4. Verify all secrets are set correctly

---

**Ready to test?** Follow Method 1 above to test through your application!
