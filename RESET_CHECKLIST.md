# ✅ Database Reset Checklist

**Print this page or keep it open while working through the reset process.**

---

## 📋 PHASE 1: DROP EXISTING DATABASE (5 min)

- [ ] Opened Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Selected project: cnjdmddqwfryvqnhirkb
- [ ] Opened SQL Editor
- [ ] Copied entire `DROP_ALL_DATABASE.sql` file
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Verified: "DROP COMPLETE! Database successfully cleaned!"
- [ ] Verified: Remaining tables = 0, functions = 0, policies = 0

**Time completed**: ___________

---

## 📋 PHASE 2: DELETE STORAGE BUCKETS (2 min)

- [ ] Opened Storage section in Supabase
- [ ] Deleted bucket: `alumni-profiles`
- [ ] Deleted bucket: `gallery-images`
- [ ] Deleted bucket: `news-images`
- [ ] Deleted bucket: `documents` (if exists)
- [ ] Verified: No buckets remain

**Time completed**: ___________

---

## 📋 PHASE 3: DELETE AUTH USERS - Optional (2 min)

- [ ] **SKIP** - Keeping existing users
- [ ] **OR** Opened Authentication → Users
- [ ] **OR** Selected all users
- [ ] **OR** Clicked "Delete users"
- [ ] **OR** Confirmed deletion

**Time completed**: ___________ or **SKIPPED**

---

## 📋 PHASE 4: CREATE NEW DATABASE SCHEMA (5 min)

- [ ] Opened new query in SQL Editor
- [ ] Copied entire `UPDATED_COMPLETE_DATABASE_SCHEMA.sql` file
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run" (waited 30-60 seconds)
- [ ] Verified tables created with query:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' ORDER BY table_name;
  ```
- [ ] Confirmed 8-9 tables exist:
  - [ ] batchmate_messages (optional)
  - [ ] gallery_albums
  - [ ] gallery_images
  - [ ] job_opportunities
  - [ ] news
  - [ ] pending_registrations
  - [ ] tracer_study_responses
  - [ ] user_profiles
  - [ ] users

**Time completed**: ___________

---

## 📋 PHASE 5: CREATE STORAGE BUCKETS (3 min)

- [ ] Opened Storage section
- [ ] Created bucket: `alumni-profiles`
  - [ ] Name: alumni-profiles
  - [ ] Public: YES
  - [ ] Size: 5MB
  - [ ] Types: images
  
- [ ] Created bucket: `gallery-images`
  - [ ] Name: gallery-images
  - [ ] Public: YES
  - [ ] Size: 10MB
  - [ ] Types: images
  
- [ ] Created bucket: `news-images`
  - [ ] Name: news-images
  - [ ] Public: YES
  - [ ] Size: 10MB
  - [ ] Types: images
  
- [ ] Created bucket: `documents` (optional)
  - [ ] Name: documents
  - [ ] Public: NO
  - [ ] Size: 20MB
  - [ ] Types: pdf, doc, docx

**Time completed**: ___________

---

## 📋 PHASE 6: CREATE ADMIN USER (5 min)

### Step 6.1: Create in Authentication

- [ ] Opened Authentication → Users
- [ ] Clicked "Add user" → "Create new user"
- [ ] Entered email: `admin@uic.edu.ph`
- [ ] Set password: `Admin@UIC2024!`
- [ ] Checked "Auto Confirm User"
- [ ] Clicked "Create user"
- [ ] **COPIED THE UUID**: ________________________________

### Step 6.2: Add to Database

- [ ] Opened SQL Editor
- [ ] Ran INSERT INTO users query (with my UUID)
- [ ] Ran INSERT INTO user_profiles query
- [ ] Verified admin exists:
  ```sql
  SELECT id, email, role, approval_status 
  FROM public.users 
  WHERE email = 'admin@uic.edu.ph';
  ```
- [ ] Confirmed: role = 'admin', approval_status = 'approved'

**Time completed**: ___________

---

## 📋 PHASE 7: UPDATE ENVIRONMENT FILES (3 min)

### Step 7.1: Get Credentials

- [ ] Opened Settings → API in Supabase
- [ ] Copied Project URL: ________________________________
- [ ] Copied anon key: ________________________________
- [ ] Copied service_role key: ________________________________

### Step 7.2: Update .env (root)

- [ ] Opened `.env` file in project root
- [ ] Verified/Updated:
  ```
  REACT_APP_SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
  REACT_APP_SUPABASE_ANON_KEY=[my anon key]
  ```
- [ ] Saved file

### Step 7.3: Create server/.env

- [ ] Created `server/.env` file
- [ ] Added:
  ```
  SUPABASE_URL=https://cnjdmddqwfryvqnhirkb.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=[my service role key]
  PORT=8000
  ```
- [ ] Saved file

**Time completed**: ___________

---

## 📋 PHASE 8: TEST THE CONNECTION (5 min)

### Step 8.1: Start Backend

- [ ] Opened Terminal/PowerShell #1
- [ ] Ran: `npm run server`
- [ ] Verified: "✅ Server running on port 8000"
- [ ] Backend is running ✅

### Step 8.2: Start Frontend

- [ ] Opened Terminal/PowerShell #2
- [ ] Ran: `npm start`
- [ ] Browser opened at http://localhost:3000
- [ ] Frontend is running ✅

### Step 8.3: Test Login

- [ ] Navigated to http://localhost:3000/login
- [ ] Entered email: `admin@uic.edu.ph`
- [ ] Entered password: `Admin@UIC2024!`
- [ ] Clicked "Login"
- [ ] Redirected to Admin Dashboard ✅
- [ ] Can see navigation menu ✅
- [ ] Clicked on "Users" - page loads ✅
- [ ] Clicked on "News" - page loads ✅

**Time completed**: ___________

---

## ✅ FINAL VERIFICATION

### Database Status
- [ ] All tables exist (8-9 tables)
- [ ] RLS policies active (30+ policies)
- [ ] Helper functions created

### Storage Status
- [ ] 3-4 storage buckets exist
- [ ] Buckets have correct permissions
- [ ] Can upload test image (optional test)

### Authentication Status
- [ ] Admin user in Supabase Auth
- [ ] Admin user in `users` table
- [ ] Admin user in `user_profiles` table
- [ ] Can login successfully

### Application Status
- [ ] Backend server running (port 8000)
- [ ] Frontend running (port 3000)
- [ ] Admin dashboard accessible
- [ ] All admin pages load
- [ ] No console errors

---

## 🎉 COMPLETION

- [ ] **ALL PHASES COMPLETED** ✅
- [ ] **SYSTEM IS OPERATIONAL** ✅
- [ ] **READY FOR USE** ✅

**Total time taken**: ___________ minutes

**Completed on**: _____________________ (date/time)

---

## 📝 Notes & Issues Encountered

```
[Space for notes]










```

---

## 🚀 Post-Reset Tasks

- [ ] Change admin password to secure password
- [ ] Create test alumni account
- [ ] Post test news article
- [ ] Upload test gallery images
- [ ] Post test job opportunity
- [ ] Test registration approval workflow
- [ ] Test tracer study submission
- [ ] Invite real alumni to register

---

## 🆘 Emergency Contacts

**If you encounter issues:**
- Review troubleshooting in `COMPLETE_DATABASE_RESET_GUIDE.md`
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Check browser console for JavaScript errors
- Check terminal for backend errors

---

**✅ RESET COMPLETE - SYSTEM READY FOR PRODUCTION USE! 🎉**
