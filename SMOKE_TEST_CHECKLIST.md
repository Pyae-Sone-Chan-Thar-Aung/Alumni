# CCS Alumni Portal - Smoke Test Checklist

## 1. Authentication & Roles
- [ ] Register as alumni (no student ID/batch). Confirm email. Login blocked until approved.
- [ ] Admin approves alumni; alumni can login.
- [ ] Coordinator can login and access job management and internal news, not user management.

## 2. Registration Flow
- [ ] Employment Status present; unemployed path hides job/company fields.
- [ ] Address labeled as Current Location; city/country required.
- [ ] Profile image upload works (<= 5MB, JPG/PNG).

## 3. Jobs
- [ ] Alumni: Share Job → submit via form.
- [ ] Alumni: Share Job → upload PDF.
- [ ] Alumni: Share Job → upload image.
- [ ] Admin/Coordinator: see pending jobs; approve/reject; approved jobs appear publicly.
- [ ] Saved job toggling works.

## 4. News & Gallery
- [ ] Unified page loads internal news and Facebook posts (if configured).
- [ ] Search filters results.
- [ ] Pagination moves between pages.
- [ ] Facebook load more fetches next posts (if available).

## 5. Internal News (Admin/Coordinator)
- [ ] Create internal news; publish on; list shows latest first.
- [ ] In-app notifications created for approved alumni.
- [ ] Toggle publish state works.

## 6. Admin Dashboard
- [ ] Simplified KPI shows Total Alumni only.
- [ ] Pending accounts table shows and paginates.
- [ ] Approve/Reject works from table and updates counts.
- [ ] Alumni Map displays markers; filters by City and Company.

## 7. Tracer Study
- [ ] Admin: Tracer Builder → create survey; add questions (varied types).
- [ ] Alumni: Tracer Study page still functional (existing page) (submit/update).

## 8. Accessibility & Responsiveness
- [ ] Navbar collapses; menu and focus styles visible on tab.
- [ ] News & Gallery grid responsive (3/2/1 columns); images crop nicely.
- [ ] Job Submission modal usable on mobile; inputs accessible.
- [ ] Filters have visible labels and aria-labels.

## 9. Notifications & Emails
- [ ] In-app notifications appear when: registration approved/rejected; job approved; internal news posted.
- [ ] Email sending: configure edge function (see EMAIL_NOTIFICATIONS_SETUP.md) and verify a sample email send.

## 10. Error Handling
- [ ] Failed Facebook fetching shows fallback (no crash).
- [ ] Supabase failures show toasts, not blank screens.

## 11. Security
- [ ] RLS policies restrict access appropriately (alumni insert jobs; view approved only).
- [ ] Coordinator limited to jobs/news, not user management.

---
Note: For Facebook feed, set environment variables: REACT_APP_FB_PAGE_ID, REACT_APP_FB_PAGE_TOKEN.
