# Debug Rejection Email - Testing Guide

## Issue
Rejection emails are not being received by users.

## What I Fixed

### Problem Identified:
The email templates were using `window.location.origin` which doesn't exist in the email service context, causing the email generation to fail silently.

### Solution Applied:
✅ Replaced `window.location.origin` with hardcoded URLs
✅ Added detailed console logging for debugging
✅ Added error handling improvements

## How to Test

### Step 1: Start Your Application
```powershell
npm start
```

### Step 2: Open Browser Console
- Press `F12` to open Developer Tools
- Go to the **Console** tab
- Keep it open during testing

### Step 3: Test Rejection Flow

1. **Register a test user** (or use existing pending registration)
   - Use a real email you can access
   
2. **Login as Admin**

3. **Go to Pending Registrations page**

4. **Reject a user registration**

5. **Watch the console output** - you should see:

```
📧 Attempting to send rejection email to: user@example.com
👤 User: First Last
📧 sendRejectionEmail called with: {email: "...", firstName: "...", ...}
📝 Subject: Update on Your CCS Alumni Registration
👤 Full name: First Last
🚀 Calling Supabase edge function send-email...
📬 To: user@example.com
📦 Edge function response - data: {...}
📦 Edge function response - error: ...
```

## What to Look For

### If Successful:
```
✅ Rejection email sent successfully!
✅ Rejection email sent successfully to user@example.com
Registration rejected successfully! Rejection email sent to user.
```

### If Failed:
```
❌ Failed to send rejection email: [error message]
❌ Error sending rejection email: [details]
```

## Common Errors and Solutions

### Error: "Edge Function returned a non-2xx status code"
**Cause:** Authentication issue with edge function

**Solution:** The edge function might need to be configured to allow authenticated calls. Check:
```powershell
npx supabase secrets list
```

### Error: "FunctionsHttpError: 403 Forbidden"
**Cause:** Edge function requires proper authentication

**Solution:** This is actually expected for direct API calls, but should work from authenticated React app. If you see this in the browser console, it means the authentication context isn't being passed properly.

### Error: "Invalid email address"
**Cause:** Email format is incorrect

**Solution:** Check that `item.email` contains a valid email

### No error but no email received
**Causes:**
1. Email went to spam folder
2. Resend API key issue
3. Email provider blocking

**Solutions:**
1. Check spam/junk folder
2. Verify Resend API key: `npx supabase secrets list`
3. Check Resend dashboard: https://resend.com/emails

## Manual Testing of Edge Function

If you want to test the edge function directly (outside the app), you'll get a 403 error - this is normal and expected. The function requires authentication that only exists when called from your authenticated React app.

## Next Steps

1. **Run the test above** and copy the console output
2. **Share the console logs** - especially any errors
3. **Check your email** (including spam folder)
4. **Check Resend dashboard** to see if emails are being sent

## Resend Dashboard Check

Go to https://resend.com/emails and look for:
- Recent email attempts
- Delivery status
- Error messages
- Bounce rates

## Expected Behavior

When you reject a user:
1. Database updates with rejection status ✅
2. Email service is called ✅
3. Edge function receives request ✅
4. Resend API sends email ✅
5. User receives email 📧
6. Console shows success ✅
7. Toast notification appears ✅

---

## Test Now!

1. Start app: `npm start`
2. Open console: `F12`
3. Reject a test user
4. **Copy ALL console output and share with me**

The detailed logging will show us exactly where the email process is failing!
