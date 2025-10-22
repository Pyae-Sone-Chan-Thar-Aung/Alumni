# 📊 Database Reset Process - Visual Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                  🔄 COMPLETE DATABASE RESET PROCESS                  │
│                         (20-30 minutes)                              │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DROP EXISTING DATABASE                       ⏱️ 5 min     │
├─────────────────────────────────────────────────────────────────────┤
│  📝 Action:                                                          │
│     1. Open Supabase SQL Editor                                     │
│     2. Copy all of DROP_ALL_DATABASE.sql                            │
│     3. Paste and Run                                                │
│                                                                      │
│  ✅ Success: "DROP COMPLETE! Database successfully cleaned!"         │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: DELETE STORAGE BUCKETS                       ⏱️ 2 min     │
├─────────────────────────────────────────────────────────────────────┤
│  🗑️ Delete in Supabase Dashboard → Storage:                         │
│     • alumni-profiles                                               │
│     • gallery-images                                                │
│     • news-images                                                   │
│     • documents                                                     │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: DELETE AUTH USERS (Optional)                 ⏱️ 2 min     │
├─────────────────────────────────────────────────────────────────────┤
│  👥 In Authentication → Users:                                       │
│     • Select all users                                              │
│     • Delete                                                        │
│                                                                      │
│  ⚠️ Skip this if you want to keep existing users                    │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 4: CREATE NEW DATABASE SCHEMA                   ⏱️ 5 min     │
├─────────────────────────────────────────────────────────────────────┤
│  📝 Action:                                                          │
│     1. Open new query in SQL Editor                                 │
│     2. Copy all of UPDATED_COMPLETE_DATABASE_SCHEMA.sql             │
│     3. Paste and Run (may take 30-60 seconds)                       │
│                                                                      │
│  ✅ Verify:                                                          │
│     SELECT table_name FROM information_schema.tables                │
│     WHERE table_schema = 'public';                                  │
│                                                                      │
│  Expected: 8-9 tables created                                       │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 5: CREATE STORAGE BUCKETS                       ⏱️ 3 min     │
├─────────────────────────────────────────────────────────────────────┤
│  📦 Create in Storage:                                               │
│     1. alumni-profiles    (Public, 5MB, images)                     │
│     2. gallery-images     (Public, 10MB, images)                    │
│     3. news-images        (Public, 10MB, images)                    │
│     4. documents          (Private, 20MB, docs) [optional]          │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 6: CREATE ADMIN USER                            ⏱️ 5 min     │
├─────────────────────────────────────────────────────────────────────┤
│  👤 Step 1: Authentication → Add User                                │
│     • Email: admin@uic.edu.ph                                       │
│     • Password: Admin@UIC2024!                                      │
│     • Auto confirm: Yes                                             │
│     • Copy the UUID!                                                │
│                                                                      │
│  👤 Step 2: SQL Editor                                               │
│     • Insert into users table (with UUID)                           │
│     • Insert into user_profiles table                               │
│                                                                      │
│  See QUICK_RESET_COMMANDS.md for SQL                                │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 7: UPDATE ENVIRONMENT FILES                     ⏱️ 3 min     │
├─────────────────────────────────────────────────────────────────────┤
│  🔑 Get keys from: Settings → API                                    │
│                                                                      │
│  📄 Update .env (root directory):                                    │
│     REACT_APP_SUPABASE_URL=https://...                              │
│     REACT_APP_SUPABASE_ANON_KEY=eyJ...                              │
│                                                                      │
│  📄 Create server/.env:                                              │
│     SUPABASE_URL=https://...                                        │
│     SUPABASE_SERVICE_ROLE_KEY=eyJ...                                │
│     PORT=8000                                                       │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 8: TEST THE CONNECTION                          ⏱️ 5 min     │
├─────────────────────────────────────────────────────────────────────┤
│  🖥️ Terminal 1:                                                      │
│     npm run server                                                  │
│     ✅ Server running on port 8000                                   │
│                                                                      │
│  🌐 Terminal 2:                                                      │
│     npm start                                                       │
│     ✅ Opens http://localhost:3000                                   │
│                                                                      │
│  🧪 Test Login:                                                      │
│     • Go to /login                                                  │
│     • Email: admin@uic.edu.ph                                       │
│     • Password: Admin@UIC2024!                                      │
│     • Should see Admin Dashboard ✅                                  │
└─────────────────────────────────────────────────────────────────────┘

    ⬇️

┌─────────────────────────────────────────────────────────────────────┐
│  ✅ SUCCESS!                                                         │
├─────────────────────────────────────────────────────────────────────┤
│  Your database is now:                                              │
│     ✅ Fresh and clean                                               │
│     ✅ Properly connected                                            │
│     ✅ Admin account working                                         │
│     ✅ Ready for production use                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Related Files

1. **`COMPLETE_DATABASE_RESET_GUIDE.md`** - Full detailed instructions
2. **`QUICK_RESET_COMMANDS.md`** - Copy-paste SQL commands
3. **`DROP_ALL_DATABASE.sql`** - Script to drop everything
4. **`UPDATED_COMPLETE_DATABASE_SCHEMA.sql`** - Script to create schema

---

## 🔗 Quick Links

| Phase | Documentation | SQL File |
|-------|--------------|----------|
| 1 | Drop Database | `DROP_ALL_DATABASE.sql` |
| 4 | Create Schema | `UPDATED_COMPLETE_DATABASE_SCHEMA.sql` |
| 6 | Admin Setup | See `QUICK_RESET_COMMANDS.md` |
| 7 | Environment | `.env` and `server/.env` |

---

## ⚠️ Common Issues

| Issue | Solution | Time |
|-------|----------|------|
| "relation does not exist" | Re-run schema SQL | 2 min |
| "Failed to fetch" | Check .env keys | 1 min |
| Can't login | Verify admin user in DB | 2 min |
| Can't upload | Check storage buckets | 1 min |

---

## 📊 Success Indicators

```
✅ Database
   ├── 8-9 tables created
   ├── 30+ RLS policies active
   └── Functions created

✅ Storage
   ├── 3-4 buckets exist
   └── Proper permissions set

✅ Authentication
   ├── Admin user in Auth
   ├── Admin in users table
   └── Admin in user_profiles

✅ Application
   ├── Backend: Port 8000 running
   ├── Frontend: Port 3000 running
   └── Can login as admin
```

---

## 🎯 What You'll Have After Reset

| Feature | Status | Tables Involved |
|---------|--------|-----------------|
| User Management | ✅ Working | users, user_profiles |
| Registration Approval | ✅ Working | pending_registrations |
| News System | ✅ Working | news |
| Job Board | ✅ Working | job_opportunities |
| Gallery | ✅ Working | gallery_albums, gallery_images |
| Tracer Study | ✅ Working | tracer_study_responses |
| File Uploads | ✅ Working | Storage buckets |

---

## 🚀 Next Steps After Reset

1. **Change Admin Password** (High Priority)
   - Login → Profile → Change Password
   
2. **Test Core Features**
   - Create test news article
   - Upload to gallery
   - Post test job
   - Create alumni account

3. **Populate Content**
   - Add university news
   - Upload event photos
   - Post job opportunities

4. **Invite Alumni**
   - Share registration link
   - Approve registrations
   - Monitor system

---

**Ready to start? Open `COMPLETE_DATABASE_RESET_GUIDE.md`** 🚀
