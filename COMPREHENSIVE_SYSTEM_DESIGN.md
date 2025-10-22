# Comprehensive User Management System Design

## 1. Database Structure Design

### Core Tables Schema

```sql
-- Users Authentication Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    graduation_year INTEGER,
    program VARCHAR(100),
    current_job VARCHAR(200),
    company VARCHAR(200),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending Registrations Table
CREATE TABLE pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    graduation_year INTEGER,
    program VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    registration_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table (for session management)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

### Feature-Specific Tables

```sql
-- News and Announcements
CREATE TABLE news_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Albums
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Images
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Opportunities
CREATE TABLE job_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(200),
    salary_range VARCHAR(100),
    job_type VARCHAR(50),
    application_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tracer Study Responses
CREATE TABLE tracer_study_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    employment_status VARCHAR(100),
    current_position VARCHAR(200),
    company_name VARCHAR(200),
    industry VARCHAR(100),
    monthly_salary DECIMAL(10,2),
    job_relevance INTEGER CHECK (job_relevance BETWEEN 1 AND 5),
    skills_adequacy INTEGER CHECK (skills_adequacy BETWEEN 1 AND 5),
    program_satisfaction INTEGER CHECK (program_satisfaction BETWEEN 1 AND 5),
    additional_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Registration Process

### Step-by-Step Registration Flow

1. **Frontend Validation**
   - Email format validation
   - Password strength requirements
   - Required field validation
   - File upload validation (profile image)

2. **Backend Processing**
   ```javascript
   // Registration endpoint
   const registerUser = async (userData) => {
     try {
       // 1. Validate input data
       const validatedData = validateRegistrationData(userData);
       
       // 2. Check if email already exists
       const existingUser = await checkEmailExists(validatedData.email);
       if (existingUser) throw new Error('Email already registered');
       
       // 3. Hash password
       const passwordHash = await bcrypt.hash(validatedData.password, 12);
       
       // 4. Upload profile image if provided
       let profileImageUrl = null;
       if (validatedData.profileImage) {
         profileImageUrl = await uploadToStorage(validatedData.profileImage);
       }
       
       // 5. Insert into pending_registrations
       const pendingRegistration = await insertPendingRegistration({
         ...validatedData,
         profile_image_url: profileImageUrl
       });
       
       // 6. Send email notification to admin
       await sendAdminNotification(pendingRegistration);
       
       return { success: true, message: 'Registration submitted for approval' };
     } catch (error) {
       throw error;
     }
   };
   ```

3. **Security Measures**
   - Password hashing with bcrypt (salt rounds: 12)
   - Input sanitization and validation
   - File upload restrictions (size, type)
   - Rate limiting on registration endpoint
   - CSRF protection

## 3. Login & Authentication

### Authentication Flow

```javascript
// Login process
const authenticateUser = async (email, password) => {
  try {
    // 1. Find user by email
    const user = await findUserByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    
    // 2. Check account status
    if (user.status !== 'approved') {
      throw new Error('Account pending approval or suspended');
    }
    
    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new Error('Invalid credentials');
    
    // 4. Generate session token
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // 5. Store session
    await createUserSession({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    // 6. Update last login
    await updateLastLogin(user.id);
    
    return {
      token: sessionToken,
      user: sanitizeUserData(user),
      expiresAt
    };
  } catch (error) {
    throw error;
  }
};
```

### Session Management

```javascript
// Middleware for authentication
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const session = await findValidSession(token);
    if (!session || session.expires_at < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = session.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 4. User-Specific Data Storage

### Data Organization Pattern

```sql
-- Example: User-specific data with proper relationships
-- All user data is linked via user_id foreign key

-- User's news posts
SELECT n.* FROM news_announcements n 
WHERE n.author_id = $user_id;

-- User's gallery contributions
SELECT gi.* FROM gallery_images gi 
WHERE gi.uploaded_by = $user_id;

-- User's job posts
SELECT jo.* FROM job_opportunities jo 
WHERE jo.posted_by = $user_id;

-- User's tracer study response
SELECT ts.* FROM tracer_study_responses ts 
WHERE ts.user_id = $user_id;
```

### Data Access Patterns

```javascript
// Service layer for user data management
class UserDataService {
  async getUserProfile(userId) {
    return await db.query(`
      SELECT u.email, u.role, u.status, up.*
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);
  }
  
  async getUserActivity(userId) {
    const [news, jobs, galleryImages] = await Promise.all([
      this.getUserNews(userId),
      this.getUserJobs(userId),
      this.getUserGalleryImages(userId)
    ]);
    
    return { news, jobs, galleryImages };
  }
  
  async updateUserProfile(userId, profileData) {
    return await db.query(`
      UPDATE user_profiles 
      SET first_name = $2, last_name = $3, current_job = $4, 
          company = $5, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId, profileData.firstName, profileData.lastName, 
        profileData.currentJob, profileData.company]);
  }
}
```

## 5. Real-time Admin Dashboard

### Dashboard Data Aggregation

```sql
-- Admin dashboard queries for real-time data
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE status = 'approved') as total_alumni,
  (SELECT COUNT(*) FROM pending_registrations) as pending_approvals,
  (SELECT COUNT(*) FROM news_announcements WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_news,
  (SELECT COUNT(*) FROM job_opportunities WHERE is_active = true) as active_jobs,
  (SELECT COUNT(*) FROM gallery_images WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_gallery_uploads,
  (SELECT COUNT(*) FROM tracer_study_responses) as tracer_study_responses;

-- Recent activity feed
CREATE OR REPLACE VIEW recent_activities AS
SELECT 'registration' as type, email as title, created_at 
FROM pending_registrations 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 'news' as type, title, created_at 
FROM news_announcements 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 'job' as type, title, created_at 
FROM job_opportunities 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;
```

### Real-time Updates Implementation

```javascript
// WebSocket or Server-Sent Events for real-time updates
class AdminDashboardService {
  async getDashboardStats() {
    const stats = await db.query('SELECT * FROM admin_dashboard_stats');
    const recentActivities = await db.query('SELECT * FROM recent_activities');
    
    return {
      stats: stats.rows[0],
      recentActivities: recentActivities.rows
    };
  }
  
  // Subscribe to database changes
  setupRealTimeUpdates() {
    // Using PostgreSQL LISTEN/NOTIFY or similar
    db.query('LISTEN dashboard_updates');
    
    db.on('notification', (msg) => {
      if (msg.channel === 'dashboard_updates') {
        this.broadcastUpdate(JSON.parse(msg.payload));
      }
    });
  }
}
```

## 6. Scalability & Maintenance

### Database Optimization

```sql
-- Essential indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_news_author_created ON news_announcements(author_id, created_at);
CREATE INDEX idx_gallery_images_album ON gallery_images(album_id);
CREATE INDEX idx_job_opportunities_active ON job_opportunities(is_active, created_at);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Partitioning for large tables (example for audit logs)
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);
```

### Backup Strategy

```sql
-- Automated backup script
-- Daily full backup
pg_dump -h localhost -U username -d database_name -f backup_$(date +%Y%m%d).sql

-- Point-in-time recovery setup
-- Enable WAL archiving in postgresql.conf
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
```

### Role-Based Access Control

```sql
-- RLS Policies for data security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY user_profiles_select_own ON user_profiles
FOR SELECT USING (user_id = auth.uid());

-- Admins can see all profiles
CREATE POLICY user_profiles_admin_all ON user_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Similar policies for other tables
CREATE POLICY news_public_read ON news_announcements
FOR SELECT USING (is_published = true);

CREATE POLICY news_admin_all ON news_announcements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

This comprehensive design provides a solid foundation for your user management system with proper security, scalability, and maintainability considerations.
