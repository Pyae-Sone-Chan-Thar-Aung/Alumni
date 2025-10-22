# CCS Alumni Portal System - Test Cases Documentation

## Software Engineering Course - Computer Science Program
**Project:** Alumni Portal System  
**Document Type:** Test Cases Specification  
**Date:** September 16, 2025

---

## Unit Testing

| Test Case ID | Feature/Module | Test Description | Preconditions | Test Steps | Expected Results | Actual Results | Status |
|--------------|----------------|------------------|---------------|------------|------------------|----------------|--------|
| UT-001 | User Authentication | Verify successful login with valid credentials | User exists in database, network active | 1. Enter valid email<br>2. Enter valid password<br>3. Click login button | User redirected to appropriate dashboard based on role | | Not Yet Tested |
| UT-002 | User Authentication | Verify login fails with invalid credentials | User exists in database | 1. Enter invalid email/password<br>2. Click login button | Error message "Invalid credentials" displayed | | Not Yet Tested |
| UT-003 | User Registration | Verify alumni registration with profile image | Registration form accessible | 1. Fill all required fields<br>2. Upload profile image (JPG/PNG, <5MB)<br>3. Submit form | Registration successful, pending approval status set | | Not Yet Tested |
| UT-004 | Password Validation | Verify password strength validation | Password validation function accessible | 1. Call validation function with "Password123!"<br>2. Call with weak password "123" | Strong password returns true, weak password returns false | | Not Yet Tested |
| UT-005 | Alumni Profile | Verify profile update function | User logged in, profile editable | 1. Navigate to profile page<br>2. Update phone number<br>3. Click save | Profile updated successfully, confirmation message displayed | | Not Yet Tested |
| UT-006 | Alumni Profile | Verify profile image upload | User logged in, storage bucket configured | 1. Click change profile image<br>2. Select valid image file<br>3. Upload | Image uploaded to Supabase storage, URL updated in database | | Not Yet Tested |
| UT-007 | Tracer Study | Verify survey response validation | Survey form accessible | 1. Submit form with missing required field<br>2. Check validation | Error message displayed for missing required fields | | Not Yet Tested |
| UT-008 | Tracer Study | Verify employment status calculation | Tracer study data exists | 1. Calculate employment rate<br>2. Generate statistics | Correct percentage calculation for employed vs total respondents | | Not Yet Tested |
| UT-009 | Admin Approval | Verify approval status update | Admin logged in, pending registrations exist | 1. Select pending registration<br>2. Click approve<br>3. Check database | User status updated to "approved", user can now login | | Not Yet Tested |
| UT-010 | Gallery Management | Verify image upload to gallery | Admin logged in, gallery accessible | 1. Navigate to gallery<br>2. Upload image with caption<br>3. Submit | Image stored in gallery_images table with metadata | | Not Yet Tested |
| UT-011 | Job Opportunities | Verify job posting creation | Admin logged in | 1. Fill job posting form<br>2. Set application deadline<br>3. Publish | Job posting saved with correct details and status | | Not Yet Tested |
| UT-012 | Batchmate Messaging | Verify message sending function | Two users logged in | 1. Select recipient<br>2. Type message<br>3. Send | Message stored in database with sender/receiver IDs | | Not Yet Tested |
| UT-013 | AI Chatbot | Verify Ollama service connection | Ollama service running | 1. Initialize chatbot<br>2. Check connection status | Connection status returns true, model availability confirmed | | Not Yet Tested |
| UT-014 | News Management | Verify news article creation | Admin logged in | 1. Create news article<br>2. Add content and images<br>3. Publish | Article saved with correct timestamp and author | | Not Yet Tested |
| UT-015 | Data Encryption | Verify sensitive data encryption | Database active | 1. Store user password<br>2. Check database storage | Password stored as encrypted hash, not plain text | | Not Yet Tested |

---

## Integration Testing

| Test Case ID | Feature/Module | Test Description | Preconditions | Test Steps | Expected Results | Actual Results | Status |
|--------------|----------------|------------------|---------------|------------|------------------|----------------|--------|
| IT-001 | Authentication & Profile | Verify login and profile access integration | User approved, RBAC configured | 1. Log in with valid alumni credentials<br>2. Navigate to profile page | User can access and view their profile data | | Not Yet Tested |
| IT-002 | Registration & Approval | Verify registration to approval workflow | Admin account exists | 1. Register new alumni<br>2. Admin reviews application<br>3. Approve registration | User receives approval notification, can login successfully | | Not Yet Tested |
| IT-003 | Tracer Study & Database | Verify survey submission updates database | User logged in, database active | 1. Complete tracer survey<br>2. Submit form<br>3. Check tracer_responses table | Survey responses stored with correct user_id and timestamp | | Not Yet Tested |
| IT-004 | Tracer Study & Analytics | Verify survey data generates analytics | Multiple survey responses exist | 1. Submit tracer study data<br>2. View admin analytics dashboard | Charts and statistics updated with new data | | Not Yet Tested |
| IT-005 | Gallery & Storage | Verify image upload to Supabase storage | Storage bucket configured | 1. Upload image to gallery<br>2. Check storage bucket<br>3. Verify database entry | Image stored in alumni-profiles bucket, URL saved in database | | Not Yet Tested |
| IT-006 | Job Posting & Alumni Access | Verify alumni can view job postings | Job posted by admin, user logged in | 1. Navigate to job opportunities page<br>2. View job listings | Job postings displayed with correct details and application links | | Not Yet Tested |
| IT-007 | Messaging & Notifications | Verify message triggers notification | Two users exist, messaging enabled | 1. Send message to batchmate<br>2. Check recipient notifications | Recipient receives in-app notification of new message | | Not Yet Tested |
| IT-008 | AI Chatbot & Tracer Data | Verify chatbot uses tracer study context | Chatbot active, tracer data exists | 1. Ask chatbot about employment statistics<br>2. Check response accuracy | Chatbot provides accurate data-driven responses | | Not Yet Tested |
| IT-009 | Admin Dashboard & Data | Verify dashboard displays real-time data | Admin logged in, system has data | 1. Login as admin<br>2. View dashboard metrics | Dashboard shows current user counts, pending approvals, recent activity | | Not Yet Tested |
| IT-010 | Profile & Storage Integration | Verify profile image update workflow | User logged in, storage configured | 1. Update profile image<br>2. Save changes<br>3. Refresh page | New image displayed, old image removed from storage | | Not Yet Tested |
| IT-011 | News & User Notifications | Verify news posting triggers notifications | Admin logged in, notification service active | 1. Post news article<br>2. Check user notifications | All users receive notification of new news article | | Not Yet Tested |
| IT-012 | Search & Database | Verify batchmate search functionality | Multiple users exist | 1. Search by graduation year<br>2. Search by program<br>3. Search by name | Search results accurately filtered from user_profiles table | | Not Yet Tested |

---

## System Testing

| Test Case ID | Feature/Module | Test Description | Preconditions | Test Steps | Expected Results | Actual Results | Status |
|--------------|----------------|------------------|---------------|------------|------------------|----------------|--------|
| ST-001 | End-to-End User Flow | Verify complete alumni journey | System deployed, database populated | 1. Register as new alumni<br>2. Wait for approval<br>3. Login and complete profile<br>4. Submit tracer study<br>5. Use all features | All steps complete successfully, data persisted correctly | | Not Yet Tested |
| ST-002 | End-to-End Admin Flow | Verify complete admin workflow | Admin account exists | 1. Login as admin<br>2. Review pending registrations<br>3. Approve/reject users<br>4. Post news and jobs<br>5. View analytics | All admin functions work correctly, data updates reflected | | Not Yet Tested |
| ST-003 | Data Privacy Compliance | Verify data encryption and security | Database active, encryption enabled | 1. Submit sensitive profile data<br>2. Check database storage<br>3. Verify access controls | Data stored encrypted, RLS policies enforced correctly | | Not Yet Tested |
| ST-004 | Performance Testing | Verify system handles concurrent users | System deployed, load testing tools ready | 1. Simulate 50 concurrent users<br>2. Perform various operations<br>3. Monitor response times | System responds within 5 seconds, no crashes or data corruption | | Not Yet Tested |
| ST-005 | Cross-Browser Compatibility | Verify system works across browsers | System deployed | 1. Test on Chrome, Firefox, Safari, Edge<br>2. Verify all features work<br>3. Check responsive design | All features functional across browsers, UI displays correctly | | Not Yet Tested |
| ST-006 | Mobile Responsiveness | Verify mobile device compatibility | System deployed | 1. Access on mobile devices<br>2. Test all major features<br>3. Check UI/UX | All features accessible and usable on mobile devices | | Not Yet Tested |
| ST-007 | Database Backup & Recovery | Verify data backup and restoration | Backup system configured | 1. Create data backup<br>2. Simulate data loss<br>3. Restore from backup | Data successfully restored, no data loss | | Not Yet Tested |
| ST-008 | Security Testing | Verify protection against common attacks | Security measures implemented | 1. Test SQL injection attempts<br>2. Test XSS attacks<br>3. Test unauthorized access | All attacks blocked, security measures effective | | Not Yet Tested |
| ST-009 | API Integration | Verify external API integrations | APIs configured | 1. Test Supabase integration<br>2. Test Ollama AI integration<br>3. Test file upload services | All APIs respond correctly, data synchronized | | Not Yet Tested |
| ST-010 | Error Handling | Verify system handles errors gracefully | System deployed | 1. Simulate network failures<br>2. Simulate database errors<br>3. Test invalid inputs | Appropriate error messages displayed, system remains stable | | Not Yet Tested |

---

## User Acceptance Testing (UAT)

| Test Case ID | Feature/Module | Test Description | Preconditions | Test Steps | Expected Results | Actual Results | Status |
|--------------|----------------|------------------|---------------|------------|------------------|----------------|--------|
| UAT-001 | Alumni Dashboard | Verify alumni can access personalized dashboard | User registered and approved | 1. Log in as alumni<br>2. View dashboard | Dashboard displays welcome message, profile summary, quick-access tiles | | Not Yet Tested |
| UAT-002 | Alumni Registration | Verify new alumni can register successfully | Registration system active | 1. Access registration page<br>2. Fill all required information<br>3. Upload profile photo<br>4. Submit application | Registration submitted successfully, pending approval message shown | | Not Yet Tested |
| UAT-003 | Profile Management | Verify alumni can update their profiles | User logged in and approved | 1. Navigate to profile page<br>2. Update personal information<br>3. Change profile photo<br>4. Save changes | Profile updated successfully, changes reflected immediately | | Not Yet Tested |
| UAT-004 | Tracer Study Completion | Verify alumni can complete tracer study | User logged in, survey available | 1. Navigate to tracer study<br>2. Fill all survey sections<br>3. Submit responses | Survey submitted successfully, thank you message displayed | | Not Yet Tested |
| UAT-005 | Job Opportunities | Verify alumni can view and apply for jobs | Job postings available | 1. Navigate to job opportunities<br>2. Browse available positions<br>3. Click "View Details"<br>4. Apply for job | Job details displayed clearly, application process intuitive | | Not Yet Tested |
| UAT-006 | Batchmate Directory | Verify alumni can search and connect with batchmates | Directory populated, user logged in | 1. Navigate to batchmates page<br>2. Search by graduation year<br>3. Send message to batchmate | Search results accurate, messaging system user-friendly | | Not Yet Tested |
| UAT-007 | Gallery Viewing | Verify alumni can view photo gallery | Gallery has content | 1. Navigate to gallery<br>2. Browse photo albums<br>3. View individual photos | Photos load quickly, navigation intuitive, albums organized well | | Not Yet Tested |
| UAT-008 | News and Updates | Verify alumni can read news and announcements | News articles published | 1. Navigate to news section<br>2. Read articles<br>3. Check for updates | News articles display properly, content readable and engaging | | Not Yet Tested |
| UAT-009 | AI Chatbot Interaction | Verify alumni can interact with AI chatbot | Chatbot integrated and functional | 1. Open chatbot interface<br>2. Ask questions about alumni data<br>3. Request information | Chatbot provides helpful, accurate responses based on system data | | Not Yet Tested |
| UAT-010 | Admin User Management | Verify admin can manage user registrations | Admin logged in, pending registrations exist | 1. View pending registrations<br>2. Review application details<br>3. Approve/reject applications | Admin interface intuitive, approval process straightforward | | Not Yet Tested |
| UAT-011 | Admin Content Management | Verify admin can manage content | Admin logged in | 1. Post news article<br>2. Add job opportunity<br>3. Upload gallery photos | Content management interface user-friendly, publishing process smooth | | Not Yet Tested |
| UAT-012 | Admin Analytics Dashboard | Verify admin can view system analytics | Admin logged in, system has data | 1. Access analytics dashboard<br>2. View tracer study statistics<br>3. Check user engagement metrics | Analytics clearly presented, data visualization helpful for decision-making | | Not Yet Tested |

---

## Bug Fixing

| Test Case ID | Feature/Module | Test Description | Preconditions | Test Steps | Expected Results | Actual Results | Status |
|--------------|----------------|------------------|---------------|------------|------------------|----------------|--------|
| BUG-001 | User Login | Fix invalid credentials error message | Login page accessible | 1. Enter invalid email/password<br>2. Click login | Clear error message: "Invalid email or password" displayed | | Not Yet Tested |
| BUG-002 | Profile Image Upload | Fix "Failed to update profile image" error | User logged in, storage configured | 1. Attempt to upload profile image<br>2. Check browser console<br>3. Verify storage bucket permissions | Profile image uploads successfully without errors | | Not Yet Tested |
| BUG-003 | Tracer Survey | Fix survey submission with incomplete fields | Survey form accessible | 1. Submit survey with missing required fields<br>2. Check validation | Clear error messages prompt user to complete all required fields | | Not Yet Tested |
| BUG-004 | Registration RLS | Fix RLS policy blocking registration | Registration system active | 1. Attempt to register new user<br>2. Check for RLS errors<br>3. Verify policy configuration | Registration completes without RLS policy conflicts | | Not Yet Tested |
| BUG-005 | Gallery Permissions | Fix gallery access permissions | Gallery system active | 1. Access gallery as different user roles<br>2. Test upload/view permissions<br>3. Check RLS policies | Gallery permissions work correctly for all user roles | | Not Yet Tested |
| BUG-006 | Duplicate Notifications | Fix duplicate email notifications | Notification service active | 1. Trigger notification event<br>2. Check email inbox<br>3. Verify notification count | Only one notification received per event | | Not Yet Tested |
| BUG-007 | Chatbot Connection | Fix Ollama service connection issues | Ollama service configured | 1. Initialize chatbot<br>2. Send test message<br>3. Check fallback responses | Chatbot works with Ollama or falls back gracefully | | Not Yet Tested |
| BUG-008 | Database Constraints | Fix foreign key constraint violations | Database active | 1. Perform operations that trigger constraints<br>2. Check error handling<br>3. Verify data integrity | Operations complete successfully or show clear error messages | | Not Yet Tested |
| BUG-009 | Session Management | Fix session timeout issues | User logged in | 1. Leave session idle<br>2. Attempt to perform actions<br>3. Check session renewal | Session timeout handled gracefully with re-authentication prompt | | Not Yet Tested |
| BUG-010 | File Upload Size | Fix file upload size validation | File upload feature active | 1. Attempt to upload file >5MB<br>2. Check validation message<br>3. Test with valid file size | Clear error message for oversized files, successful upload for valid sizes | | Not Yet Tested |
| BUG-011 | Mobile UI Issues | Fix mobile interface display problems | Mobile device or responsive mode | 1. Access system on mobile device<br>2. Navigate through all pages<br>3. Test form interactions | All UI elements display correctly and are fully functional on mobile | | Not Yet Tested |
| BUG-012 | Search Functionality | Fix search results accuracy | Search feature active, data populated | 1. Perform various search queries<br>2. Check result relevance<br>3. Test edge cases | Search returns accurate, relevant results for all query types | | Not Yet Tested |

---

## Test Environment Setup

### Prerequisites
- **Database:** Supabase with all required tables and RLS policies
- **Storage:** Supabase storage bucket configured for profile images
- **AI Service:** Ollama running locally with appropriate models
- **Browser:** Latest versions of Chrome, Firefox, Safari, Edge
- **Network:** Stable internet connection for API calls
- **Test Data:** Sample users, alumni profiles, tracer study responses

### Test Data Requirements
- **Admin Users:** At least 2 admin accounts with different permission levels
- **Alumni Users:** At least 20 approved alumni from different graduation years
- **Pending Registrations:** At least 5 pending approval applications
- **Tracer Study Data:** Sample responses covering various employment statuses
- **Gallery Content:** Sample photo albums with various image formats
- **Job Postings:** Active and expired job opportunities
- **News Articles:** Published articles with different content types

### Testing Tools
- **Manual Testing:** Browser developer tools, network monitoring
- **Load Testing:** Artillery.io or similar tools for performance testing
- **Security Testing:** OWASP ZAP for vulnerability scanning
- **Mobile Testing:** Browser responsive mode and actual mobile devices
- **Database Testing:** Supabase dashboard and SQL query tools

---

## Test Execution Guidelines

1. **Test Sequence:** Execute tests in order: Unit → Integration → System → UAT → Bug Fixes
2. **Documentation:** Record actual results, screenshots, and error messages
3. **Bug Reporting:** Create detailed bug reports with reproduction steps
4. **Retesting:** Re-execute failed tests after bug fixes
5. **Sign-off:** Obtain stakeholder approval before production deployment

---

## Success Criteria

- **Unit Tests:** 95% pass rate for all core functionality tests
- **Integration Tests:** All module interactions work correctly
- **System Tests:** End-to-end workflows complete successfully
- **UAT Tests:** All user scenarios meet acceptance criteria
- **Performance:** System handles expected load with <5 second response times
- **Security:** No critical vulnerabilities identified
- **Bug Fixes:** All identified bugs resolved and verified

---

*Document prepared for Software Engineering Course - Computer Science Program*  
*CCS Alumni Portal System Testing Documentation*
