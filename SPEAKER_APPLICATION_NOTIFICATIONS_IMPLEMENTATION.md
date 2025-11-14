# Speaker Application Approval/Rejection Notifications

## Overview
This implementation adds a complete notification system that sends both in-app notifications and email notifications to applicants when their speaker/keynote/moderator applications are approved or rejected by admins.

## Changes Made

### 1. Email Service Functions (`src/utils/emailService.js`)

Added two new email functions:

#### `sendSpeakerApplicationApprovalEmail()`
- Sends a congratulatory email when an application is approved
- Includes event details (title, date, location, role)
- Provides next steps for the approved speaker
- Professional green-themed design

#### `sendSpeakerApplicationRejectionEmail()`
- Sends a polite rejection email with optional feedback
- Includes reviewer's notes if provided
- Encourages future participation
- Professional design with constructive messaging

### 2. Admin Dashboard Updates (`src/pages/AdminProfessionalDevelopment.js`)

#### Updated Imports
```javascript
import { 
  sendEventInvitationEmail, 
  sendSpeakerInvitationEmail, 
  sendSpeakerApplicationApprovalEmail, 
  sendSpeakerApplicationRejectionEmail 
} from '../utils/emailService';
```

#### Enhanced `handleApplicationAction()` Function
The function now:

1. **Retrieves application details** before processing
2. **Updates application status** in the database with review information
3. **Fetches event details** for notification content
4. **Creates in-app notification** in the `event_notifications` table
5. **Sends email notification** to the applicant
   - Approval email for approved applications
   - Rejection email (with optional feedback) for rejected applications

## Notification Flow

### When Admin Approves Application:
1. Application status updated to "approved"
2. In-app notification created: "Speaker Application Approved"
3. Email sent with:
   - Congratulations message
   - Event details (title, role, date, location)
   - Next steps
   - Link to event details page

### When Admin Rejects Application:
1. Application status updated to "rejected"
2. In-app notification created: "Speaker Application Update"
3. Email sent with:
   - Polite rejection message
   - Optional feedback/review notes
   - Encouragement to apply for future events
   - Link to other events

## Database Tables Used

### `speaker_applications`
- Stores the application status (pending, approved, rejected)
- Stores review information (reviewed_by, reviewed_at, review_notes)

### `event_notifications`
- Stores in-app notifications for users
- Notification type: `speaker_application_reviewed`
- Linked to both event and user

## User Experience

### For Applicants:
1. **In-App Notification**: Appears in the notification bell
2. **Email Notification**: Sent to their registered email
3. **Clear Status**: Can see their application status in their profile

### For Admins:
1. View all pending applications in the "Speaker Applications" tab
2. Click approve/reject buttons
3. Can optionally add review notes for rejected applications
4. Automatic notification handling

## Testing Checklist

- [ ] Admin can approve speaker applications
- [ ] Admin can reject speaker applications
- [ ] Applicants receive in-app notifications for approval
- [ ] Applicants receive in-app notifications for rejection
- [ ] Applicants receive approval emails
- [ ] Applicants receive rejection emails
- [ ] Email includes correct event details
- [ ] Review notes appear in rejection emails
- [ ] Notifications appear in notification bell
- [ ] Email service handles errors gracefully

## Future Enhancements

1. **Batch Actions**: Allow approving/rejecting multiple applications at once
2. **Templates**: Admin-configurable rejection message templates
3. **Appeal Process**: Allow applicants to update and resubmit rejected applications
4. **Notification Preferences**: Let users choose email vs in-app notifications
5. **SMS Notifications**: Add SMS option for critical notifications

## Related Files

- `src/utils/emailService.js` - Email service functions
- `src/pages/AdminProfessionalDevelopment.js` - Admin dashboard with application management
- `src/pages/ProfessionalDevelopmentEvents.js` - User-facing events page
- `create_professional_development_events_tables.sql` - Database schema

## Support

For issues or questions, please refer to the main README or contact the development team.
