# Professional Development Events System Setup Guide

## Overview
This system allows authenticated alumni to:
- View and join professional development events
- Apply to be speakers or keynote speakers
- Receive event notifications

Admins can:
- Create and manage events
- Invite alumni to participate in events
- Invite alumni to be speakers
- Review speaker applications

## Database Setup

1. Run the SQL schema file to create all necessary tables:
   ```sql
   -- Execute the file: create_professional_development_events_tables.sql
   ```

   This creates the following tables:
   - `professional_development_events` - Main events table
   - `event_participants` - Tracks alumni registration for events
   - `event_speakers` - Manages speaker assignments
   - `speaker_applications` - Stores alumni applications to be speakers
   - `event_notifications` - Event-related notifications

## Features Implemented

### For Authenticated Alumni:
1. **Browse Events**
   - View all published professional development events
   - Filter by status (upcoming, ongoing, past)
   - Search events by title, description, or location

2. **Join Events**
   - Register for events with one click
   - View registration status
   - See participant count

3. **Apply as Speaker**
   - Apply to be a speaker or keynote speaker
   - Submit application with proposed topic and description
   - Include speaking experience and qualifications

### For Admins:
1. **Create Events**
   - Create new professional development events
   - Set event details (title, description, dates, venue, location)
   - Set maximum participants, registration requirements
   - Mark events as draft or published

2. **Invite Alumni**
   - Search and invite specific alumni to events
   - Sends notification to invited alumni

3. **Invite Speakers**
   - Search and invite alumni to be speakers
   - Assign role (speaker, keynote speaker, panelist, moderator)
   - Sends notification to invited speakers

4. **Review Applications**
   - View and review speaker applications from alumni
   - Approve or reject applications

## Access

- **Route**: `/professional-development`
- **Authentication**: Required (only registered/alumni accounts)
- **Home Page Link**: Click "Professional Development" on the home page (only visible to authenticated users)

## Database Tables Schema

### professional_development_events
- Event information and details
- Status management (draft, published, ongoing, completed, cancelled)
- Admin tracking (created_by, updated_by)

### event_participants
- Tracks alumni participation
- Supports invitation types (self, admin_invite, batchmate_invite)
- Registration status tracking

### event_speakers
- Speaker assignments per event
- Role management (speaker, keynote_speaker, panelist, moderator)
- Invitation status tracking

### speaker_applications
- Alumni applications to be speakers
- Application status (pending, under_review, approved, rejected)
- Review tracking by admins

### event_notifications
- Event-related notifications to alumni
- Notification types (event_created, invitation_sent, speaker_invitation, etc.)
- Read/unread status tracking

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Authenticated users can view published events
- Users can manage their own registrations and applications
- Admins have full access to manage events, participants, and speakers
- Notifications are accessible by the recipient user or admins

## Next Steps

1. Execute the SQL schema file in your Supabase SQL Editor
2. Test the system by:
   - Logging in as an admin and creating an event
   - Logging in as an alumni and joining an event
   - Applying for a speaker position
   - Inviting alumni to events (admin only)

## Notes

- Events must be marked as "published" to be visible to alumni
- Speaker invitations require acceptance by the invited alumni
- Speaker applications are pending until reviewed by an admin
- Notifications are automatically created when invitations are sent

