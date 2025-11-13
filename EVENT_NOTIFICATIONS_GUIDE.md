# Event Notifications System

## Overview
The event notification system has been implemented with two channels:
1. **In-app notifications** via notification bell in navbar
2. **Email notifications** sent to alumni's registered email

## Features Implemented

### 1. Notification Bell Component
- **Location**: Top navigation bar (visible to all authenticated users)
- **Features**:
  - Real-time updates using Supabase subscriptions
  - Unread count badge (shows number up to 99+)
  - Dropdown with latest 20 notifications
  - Click notification to mark as read
  - "Mark all as read" button
  - Auto-closes when clicking outside
  - Different icons for different notification types

**Notification Types**:
- 🗓️ Event invitations
- 🎤 Speaker invitations
- ✅ Registration confirmations
- 📢 Event reminders
- 🔔 General event updates

### 2. Email Notifications

**Event Invitations** - When an alumni is invited to an event:
- **Subject**: "🎉 You're Invited: [Event Name]"
- **Content**:
  - Personalized greeting
  - Event details (title, date, location)
  - Call-to-action button to view event
  - Professional HTML template with UIC branding

**Speaker Invitations** - When an alumni is invited as a speaker:
- **Subject**: "🎬 Speaker Invitation: [Event Name]"
- **Content**:
  - Personalized greeting with role (Speaker, Keynote Speaker, Panelist, Moderator)
  - Highlighted role invitation
  - Event details including assigned role
  - Call-to-action button to view and respond
  - Professional HTML template with golden/orange theme

### 3. Duplicate Prevention
Both invitation functions now check for existing registrations before creating duplicates:
- Shows friendly "Already registered" message instead of database error
- Uses `.maybeSingle()` to safely check for existing records

## How It Works

### When Admin Invites Alumni:

1. **Database Check**: Verifies alumni isn't already registered
2. **Create Registration**: Inserts record in `event_participants` table
3. **Create Notification**: Inserts record in `event_notifications` table
4. **Send Email**: Calls `sendEventInvitationEmail()` function
5. **Real-time Update**: Notification bell automatically updates for the invited alumni

### For Alumni:

1. **Bell Icon**: Shows red badge with unread count
2. **Click Bell**: Opens dropdown with notifications
3. **Click Notification**: Marks as read and badge updates
4. **Email**: Receives invitation in their inbox
5. **View Event**: Can click link to see event details

## Files Modified

### New Files:
- `src/components/NotificationBell.js` - Main notification component
- `src/components/NotificationBell.css` - Styling for notification bell

### Modified Email Service:
- `src/utils/emailService.js`:
  - Added `sendEventInvitationEmail()` function
  - Added `sendSpeakerInvitationEmail()` function

### Modified Files:
- `src/components/Navbar.js` - Added NotificationBell component
- `src/pages/ProfessionalDevelopmentEvents.js`:
  - Fixed duplicate check for alumni invites with `.maybeSingle()`
  - Fixed duplicate check for speaker invites
  - Added in-app notification for speaker invites
  - Added email notification for both alumni and speaker invites
- `src/pages/AdminProfessionalDevelopment.js`:
  - Added duplicate check for alumni invites
  - Added duplicate check for speaker invites
  - Added in-app notification for both alumni and speaker invites
  - Added email notification for both alumni and speaker invites

## Database Tables Used

### event_notifications
```sql
- id (UUID)
- event_id (UUID, references professional_development_events)
- user_id (UUID, references users)
- notification_type (TEXT)
- title (TEXT)
- message (TEXT)
- is_read (BOOLEAN)
- read_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### event_participants
```sql
- id (UUID)
- event_id (UUID)
- user_id (UUID)
- status (TEXT)
- invitation_type (TEXT)
- invited_by (UUID)
- invited_at (TIMESTAMP)
- UNIQUE constraint on (event_id, user_id)
```

## Testing Checklist

### ✅ To Test the System:

1. **In-App Notifications**:
   - [ ] Login as admin
   - [ ] Create an event
   - [ ] Invite an alumni to the event
   - [ ] Login as that alumni
   - [ ] Check notification bell shows unread count
   - [ ] Click bell and verify notification appears
   - [ ] Click notification to mark as read
   - [ ] Verify unread count decreases

2. **Email Notifications**:
   - [ ] Invite an alumni to an event
   - [ ] Check alumni's email inbox
   - [ ] Verify email received with correct details
   - [ ] Verify email formatting and links work

3. **Duplicate Prevention**:
   - [ ] Try inviting the same alumni twice
   - [ ] Verify "Already registered" toast appears
   - [ ] No database error occurs

4. **Real-time Updates**:
   - [ ] Have alumni logged in
   - [ ] Invite them to an event from admin panel
   - [ ] Notification bell should update automatically
   - [ ] No page refresh needed

## Troubleshooting

### Notifications not appearing?
- Check if Supabase realtime is enabled for `event_notifications` table
- Verify user_id matches in both users and event_notifications tables
- Check browser console for errors

### Emails not sending?
- Ensure Supabase Edge Function `send-email` is deployed
- Check edge function logs for errors
- Verify email service is configured correctly
- Check spam/junk folder

### Badge count wrong?
- Check `is_read` field in database
- Verify fetchNotifications() is being called
- Check for console errors

## Future Enhancements

Possible improvements:
- Add notification preferences (email/in-app toggle)
- Add notification sound
- Add push notifications for mobile
- Add notification filtering by type
- Add "see all notifications" page
- Add notification history/archive
- Add digest emails (daily/weekly summary)
