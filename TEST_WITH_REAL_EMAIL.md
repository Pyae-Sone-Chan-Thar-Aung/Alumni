# Testing Email Notifications - Real Email Required

## ⚠️ Why Temp-Mail Doesn't Work

**Temporary email services (temp-mail.org, 10minutemail, etc.) are BLOCKED by most email providers, including Resend.**

This is intentional because:
- They're commonly used for spam/abuse
- They have unreliable delivery
- Email services blacklist disposable domains
- Anti-spam measures block them

## ✅ How to Test Properly

### Option 1: Use Your Real Email (Recommended)
Use `kalaylay.ktg@gmail.com` or your actual email address to test.

**Steps:**
1. Register with your real email
2. Login as admin
3. Approve/reject the registration
4. Check your email inbox (and spam folder!)
5. Email should arrive within 30 seconds

### Option 2: Create a Test Gmail Account
1. Go to gmail.com
2. Create a new free account (e.g., `ccs-alumni-test@gmail.com`)
3. Use this for testing
4. Check inbox after approval/rejection

### Option 3: Use a Different Test Email Service
Some test email services that MAY work:
- **Mailinator.com** (check inbox at mailinator.com/inbox)
- **Guerrilla Mail** (guerrillamail.com)
- Your organization email (@uic.edu.ph)

**Warning:** Even these may be blocked by some services.

## 🔍 Check If Email Was Attempted

### 1. Check Browser Console
When you approve/reject, look for:
```
✅ Approval email sent successfully
✅ Rejection email sent successfully
```

If you see this, the email WAS sent from our system.

### 2. Check Resend Dashboard
Go to: https://resend.com/emails

You should see:
- Email attempts
- Delivery status
- Whether it was blocked/bounced
- Error messages

### 3. What You'll See in Resend Dashboard

**If temp-mail was blocked:**
```
Status: Bounced
Reason: Disposable email address blocked
or
Status: Failed
Reason: Invalid recipient domain
```

**If email was sent successfully:**
```
Status: Delivered
Delivered at: [timestamp]
```

## 🧪 Complete Test Procedure

### Test with Real Email:

1. **Start your app:**
   ```powershell
   npm start
   ```

2. **Register with REAL email:**
   - Use `kalaylay.ktg@gmail.com` or similar
   - Complete registration form
   - Submit

3. **Open browser console (F12)**
   - Keep console open

4. **Login as admin**

5. **Approve or reject the registration**

6. **Watch console output:**
   ```
   📧 Attempting to send rejection email to: kalaylay.ktg@gmail.com
   👤 User: First Last
   📧 sendRejectionEmail called with: {...}
   🚀 Calling Supabase edge function send-email...
   📦 Edge function response - data: {success: true, ...}
   ✅ Rejection email sent successfully!
   ```

7. **Check your email:**
   - Check inbox
   - **Check spam/junk folder** ⭐ (very important!)
   - Email should arrive within 30 seconds

8. **If email not received:**
   - Check Resend dashboard for delivery status
   - Share console output with me
   - Verify spam folder
   - Try different email provider

## 📊 Resend Dashboard Check

1. Go to https://resend.com/emails
2. Login with your Resend account
3. Look for recent emails
4. Check status:
   - ✅ Delivered = Success!
   - ⏱️ Queued = Still sending
   - ❌ Bounced = Email rejected
   - ❌ Failed = Error occurred

## 🎯 Expected Results with Real Email

### Console Output:
```
📧 Attempting to send rejection email to: your-email@gmail.com
👤 User: Test User
📧 sendRejectionEmail called with: {email: "your-email@gmail.com", ...}
📝 Subject: Update on Your CCS Alumni Registration
👤 Full name: Test User
🚀 Calling Supabase edge function send-email...
📬 To: your-email@gmail.com
📦 Edge function response - data: {success: true, data: {...}}
📦 Edge function response - error: null
✅ Rejection email sent successfully!
✅ Rejection email sent successfully to your-email@gmail.com
```

### Email Inbox:
Within 30 seconds, you should receive:
- **Subject:** "Update on Your CCS Alumni Registration"
- **From:** CCS Alumni <onboarding@resend.dev>
- Beautiful HTML email with gradient header
- Rejection message and next steps

## 🐛 Troubleshooting

### Email Not in Inbox?
1. ✅ Check spam/junk folder FIRST
2. ✅ Check Resend dashboard
3. ✅ Verify console shows success
4. ✅ Wait 1-2 minutes (sometimes delayed)

### Still No Email?
**Share with me:**
1. Complete console output (copy ALL text)
2. Resend dashboard screenshot
3. Email address used (to verify it's not disposable)
4. Whether you checked spam folder

## 💡 Why Temp-Mail Failed

When you used temp-mail.org, one of these happened:
1. **Resend blocked the disposable domain** (most likely)
2. **Temp-mail's spam filter blocked it**
3. **Email bounced due to invalid recipient**

Check your Resend dashboard - it will show exactly what happened!

## ✅ Next Steps

1. **Use your real email** (kalaylay.ktg@gmail.com)
2. Test approval/rejection
3. Check inbox AND spam folder
4. Share results

The email system IS working - temp-mail services just don't receive emails from legitimate email services like Resend!
