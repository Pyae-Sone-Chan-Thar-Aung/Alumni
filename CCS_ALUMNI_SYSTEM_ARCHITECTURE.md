# CCS Alumni Portal System Architecture

## 1. System Overview

**System Name:** UIC Alumni Portal  
**Version:** 1.0.0  
**Institution:** University of the Immaculate Conception - College of Computer Studies  
**Architecture Type:** 3-Tier Modern Web Architecture with Microservice-oriented Backend Services  

### Architecture Philosophy
The CCS Alumni Portal follows a modern, scalable 3-tier architecture designed for maintainability, security, and performance. The system leverages cloud-native services (Supabase) for backend operations while maintaining a responsive, component-based frontend architecture.

---

## 2. System Architecture Overview

### 2.1. Architecture Type
**Modern 3-Tier Architecture** with Cloud-Native Backend Services

| Tier | Description | Technology Stack |
|------|-------------|------------------|
| **Presentation Tier** | User-facing interfaces for alumni, admins, and coordinators | React.js, CSS3, Responsive Design |
| **Application Tier** | Business logic, API services, and data processing | Supabase Edge Functions, Node.js Services |
| **Data Tier** | Centralized data storage with real-time capabilities | Supabase (PostgreSQL), Cloud Storage |

---

## 3. Detailed Tier Architecture

### 3.1. Presentation Tier (Client-Side)

#### Core Technologies
- **Frontend Framework:** React.js 18.2.0
- **Routing:** React Router DOM 6.3.0
- **State Management:** React Context API with AuthContext
- **UI Components:** Custom components with modular CSS
- **Styling:** CSS3 with UIC branding (Maroon #8B0000, Gold #FFD700)
- **Icons:** React Icons 4.10.1
- **Charts:** Chart.js 4.3.0 with React-ChartJS-2
- **File Handling:** React Dropzone 14.2.3
- **Notifications:** React Toastify 9.1.3

#### Key Components Architecture

```
src/
├── components/
│   ├── Navbar.js              # Navigation with role-based access
│   ├── Footer.js              # University branding footer
│   ├── LoadingSpinner.js      # Reusable loading indicator
│   ├── ErrorBoundary.js       # Error handling wrapper
│   ├── Chatbot.js             # AI-powered assistant
│   ├── BatchmateMessaging.js  # Alumni communication
│   └── PDFReport.js           # Report generation
├── pages/
│   ├── Alumni/
│   │   ├── AlumniDashboard.js    # Main alumni interface
│   │   ├── AlumniProfile.js      # Profile management
│   │   ├── TracerStudy.js        # Survey participation
│   │   ├── JobOpportunities.js   # Career services
│   │   ├── Batchmates.js         # Alumni networking
│   │   └── Gallery.js            # Photo sharing
│   ├── Admin/
│   │   ├── AdminDashboard.js     # Analytics & overview
│   │   ├── AdminUsers.js         # User management
│   │   ├── AdminNews.js          # Content management
│   │   ├── AdminTracerStudy.js   # Survey management
│   │   └── AdminPendingRegistrations.js # Approval workflow
│   └── Auth/
│       ├── Login.js              # Authentication
│       ├── Register.js           # Registration with approval
│       └── Profile.js            # Profile editing
└── config/
    ├── supabaseClient.js      # Database connection
    ├── constants.js           # App configuration
    └── database.js            # Database utilities
```

#### User Interface Features
- **Responsive Design:** Mobile-first approach with Bootstrap-like grid system
- **Role-Based Navigation:** Dynamic menu based on user permissions
- **Real-time Updates:** Live data synchronization via Supabase subscriptions
- **Progressive Web App:** Offline-ready capabilities
- **Accessibility:** WCAG 2.1 compliant interfaces

### 3.2. Application Tier (Backend Services)

#### Core Backend Architecture
**Primary Backend:** Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with JWT tokens
- **Real-time:** WebSocket connections for live updates
- **Storage:** Supabase Storage for file management
- **Edge Functions:** Serverless functions for complex operations

#### Service Architecture

| Service Module | Purpose | Implementation |
|----------------|---------|----------------|
| **Authentication Service** | User login, registration, MFA, session management | Supabase Auth + Custom validation |
| **Alumni Management Service** | CRUD operations for alumni profiles, document requests | Supabase Database + RLS policies |
| **Tracer Study Service** | Dynamic survey generation, validation, data collection | React forms + Supabase storage |
| **Communication Service** | Announcements, notifications, batchmate messaging | Supabase real-time + email integration |
| **Admin Portal Service** | Administrative interfaces, user approval workflow | Role-based access control |
| **Analytics & Reporting Service** | Data visualization, PDF generation, insights | Chart.js + jsPDF + custom analytics |
| **AI Chatbot Service** | Intelligent assistant for alumni queries | Ollama integration with local LLM |
| **File Management Service** | Document upload, storage, retrieval | Supabase Storage with security policies |

#### AI Integration Architecture
```javascript
// Ollama Service Integration
OllamaService {
  baseURL: 'http://localhost:11434'
  models: ['llama3.2:1b', 'llama3.2:3b', 'llama3.1:8b', 'gpt-oss:20b']
  features: {
    - Contextual responses using tracer study data
    - Smart model fallback for memory constraints
    - Conversation history management
    - Real-time streaming responses
    - Predefined question suggestions
  }
}
```

### 3.3. Data Tier (Storage & Persistence)

#### Database Architecture
**Primary Database:** Supabase PostgreSQL
- **High Availability:** Multi-region deployment
- **Security:** Row Level Security (RLS) policies
- **Performance:** Indexed queries and optimized schemas
- **Backup:** Automated daily backups with point-in-time recovery

#### Database Schema Overview

```sql
-- Core Tables
users                    # User authentication data
user_profiles           # Extended user information
pending_registrations   # Registration approval workflow
tracer_study_responses  # Survey data collection
news                    # Announcements and updates
gallery_albums          # Photo organization
gallery_images          # Image metadata
job_opportunities       # Career postings
batchmate_messages      # Alumni communication

-- Storage Buckets
alumni-profiles         # Profile images (5MB limit)
documents              # Official documents
gallery-images         # Photo gallery
job-attachments        # Career-related files
```

#### Data Security Implementation
```sql
-- Row Level Security Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all data" ON user_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- Storage Security
CREATE POLICY "Alumni can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'alumni-profiles');
```

---

## 4. System Integration & Communication

### 4.1. API Architecture
**RESTful API Pattern** via Supabase Auto-generated APIs
- **Authentication:** JWT-based with automatic token refresh
- **Data Operations:** CRUD via Supabase client library
- **Real-time:** WebSocket subscriptions for live updates
- **File Operations:** Supabase Storage API

### 4.2. Inter-Component Communication
```javascript
// Frontend to Backend Communication
supabaseClient -> PostgreSQL Database
supabaseClient -> Storage Buckets
supabaseClient -> Real-time Subscriptions
OllamaService -> Local AI Model (localhost:11434)

// Real-time Data Flow
Database Changes -> Supabase Realtime -> React Components -> UI Updates
```

### 4.3. External Service Integrations
| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| **Supabase** | Primary backend services | JavaScript SDK |
| **Ollama** | Local AI model hosting | REST API calls |
| **Email Service** | Notifications (planned) | SMTP integration |
| **PDF Generation** | Report creation | jsPDF library |
| **Chart Rendering** | Data visualization | Chart.js library |

---

## 5. Security Architecture

### 5.1. Authentication & Authorization
```javascript
// Multi-layer Security Model
1. Supabase Authentication (JWT tokens)
2. Row Level Security (Database policies)
3. Role-Based Access Control (Admin/Alumni)
4. Session Management (Auto-refresh tokens)
5. Input Validation (Client & server-side)
```

### 5.2. Data Protection
- **Encryption:** Data encrypted at rest and in transit (TLS 1.3)
- **Access Control:** Granular permissions via RLS policies
- **Audit Logging:** All administrative actions logged
- **File Security:** Secure upload with type validation
- **Privacy:** GDPR-compliant data handling

### 5.3. Security Policies
```sql
-- User Data Protection
- Users can only access their own data
- Admins have controlled access to all data
- Pending registrations require approval
- File uploads are validated and scanned

-- Storage Security
- 5MB file size limits
- Allowed file types: JPG, PNG, PDF
- Secure file naming and storage
- Public access only for approved content
```

---

## 6. System Features & Capabilities

### 6.1. Alumni Management System
- **Registration Workflow:** Multi-step registration with admin approval
- **Profile Management:** Comprehensive alumni profiles with photo upload
- **Batch Management:** Graduation year-based organization
- **Status Tracking:** Approval workflow (Pending → Approved → Active)

### 6.2. Tracer Study System
- **Dynamic Surveys:** Configurable questionnaires
- **Data Analytics:** Employment statistics and trends
- **Report Generation:** PDF reports with charts and insights
- **Response Tracking:** Participation monitoring

### 6.3. Communication Features
- **Batchmate Messaging:** Alumni networking platform
- **News & Announcements:** Administrative content management
- **AI Chatbot:** Intelligent assistant for queries
- **Notification System:** Real-time updates

### 6.4. Administrative Tools
- **User Management:** Alumni approval and role assignment
- **Content Management:** News, job postings, gallery
- **Analytics Dashboard:** System usage and engagement metrics
- **Data Export:** CSV/PDF report generation

---

## 7. Deployment Architecture

### 7.1. Current Deployment Model
```
Development Environment:
├── Frontend: React Dev Server (localhost:3000)
├── Backend: Supabase Cloud (xveajhcqrnhxxkhgmtbc.supabase.co)
├── AI Service: Ollama Local (localhost:11434)
└── Database: Supabase PostgreSQL (Cloud)

Production Deployment Options:
├── Frontend: Netlify/Vercel (Static hosting)
├── Backend: Supabase Production (Managed)
├── AI Service: Docker Container (Cloud VM)
└── CDN: CloudFlare (Global distribution)
```

### 7.2. Scalability Considerations
- **Horizontal Scaling:** Supabase auto-scaling database
- **CDN Distribution:** Static asset optimization
- **Caching Strategy:** Browser and server-side caching
- **Load Balancing:** Supabase built-in load balancing

---

## 8. Performance & Monitoring

### 8.1. Performance Optimization
```javascript
// Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization
- Efficient re-rendering with React.memo()

// Backend Optimizations
- Database indexing on frequently queried columns
- Connection pooling via Supabase
- Efficient SQL queries with proper joins
- File compression and CDN delivery
```

### 8.2. Monitoring & Analytics
- **Application Monitoring:** Error tracking with ErrorBoundary
- **Performance Metrics:** Web Vitals monitoring
- **User Analytics:** Engagement and usage tracking
- **System Health:** Database performance monitoring

---

## 9. Data Flow Architecture

### 9.1. User Registration Flow
```
1. User fills registration form -> 2. Data validation (client-side)
3. Submit to Supabase -> 4. Store in pending_registrations table
5. Admin notification -> 6. Admin review and approval
7. Create user account -> 8. Update user_profiles table
9. Send approval notification -> 10. User can login
```

### 9.2. Tracer Study Data Flow
```
1. Admin creates survey -> 2. Alumni receives notification
3. Alumni completes survey -> 4. Data stored in tracer_study_responses
5. Real-time analytics update -> 6. Dashboard reflects new data
7. AI chatbot context updated -> 8. Reports generated automatically
```

### 9.3. AI Chatbot Interaction Flow
```
1. User asks question -> 2. Check Ollama connection
3. Generate context from tracer data -> 4. Send to AI model
5. Process AI response -> 6. Return formatted answer
7. Update conversation history -> 8. Display to user
```

---

## 10. Technology Stack Summary

### 10.1. Frontend Stack
```javascript
Core: React 18.2.0 + React Router DOM 6.3.0
Styling: CSS3 + Custom Components
Charts: Chart.js 4.3.0 + React-ChartJS-2 5.2.0
Forms: React Dropzone 14.2.3
Icons: React Icons 4.10.1
Notifications: React Toastify 9.1.3
PDF: jsPDF 3.0.2 + jsPDF-AutoTable 5.0.2
HTTP: Axios 1.4.0
Date: Moment.js 2.29.4 + date-fns 4.1.0
```

### 10.2. Backend Stack
```javascript
BaaS: Supabase (PostgreSQL + Auth + Storage + Realtime)
AI: Ollama (Local LLM hosting)
Authentication: Supabase Auth (JWT-based)
Database: PostgreSQL with Row Level Security
Storage: Supabase Storage (File management)
Real-time: Supabase Realtime (WebSocket)
```

### 10.3. Development Tools
```javascript
Build Tool: React Scripts 5.0.1
Testing: Jest + React Testing Library
Version Control: Git
Package Manager: npm
Code Quality: ESLint + React App Config
```

---

## 11. Future Enhancements & Roadmap

### 11.1. Planned Features
- **Mobile Application:** React Native implementation
- **Advanced Analytics:** Machine learning insights
- **Email Integration:** Automated notifications
- **Social Features:** Enhanced alumni networking
- **Document Management:** Digital transcript system

### 11.2. Scalability Improvements
- **Microservices Migration:** Break down monolithic components
- **API Gateway:** Centralized API management
- **Caching Layer:** Redis implementation
- **Search Engine:** Elasticsearch integration
- **CDN Optimization:** Global content delivery

---

## 12. System Maintenance & Support

### 12.1. Backup Strategy
- **Database:** Daily automated backups via Supabase
- **Files:** Redundant storage with versioning
- **Code:** Git-based version control
- **Configuration:** Environment variable management

### 12.2. Monitoring & Alerts
- **Uptime Monitoring:** Service availability tracking
- **Error Tracking:** Automated error reporting
- **Performance Monitoring:** Response time tracking
- **Security Monitoring:** Intrusion detection

---

## 13. Conclusion

The CCS Alumni Portal represents a modern, scalable solution for alumni engagement and data management. Built on proven technologies like React and Supabase, the system provides:

- **Comprehensive Alumni Management** with approval workflows
- **Advanced Tracer Study Capabilities** with analytics
- **AI-Powered Assistance** for enhanced user experience
- **Secure, Role-Based Access Control** for data protection
- **Real-time Communication Features** for community building
- **Scalable Architecture** for future growth

The 3-tier architecture ensures maintainability, security, and performance while leveraging cloud-native services for reliability and scalability. The system is designed to grow with the institution's needs while maintaining high standards of security and user experience.

---

## Part II: System Design – Physical Design

### 5.3.1 Database Design

The CCS Alumni Portal database is refined from the ERD into a normalized relational schema. All tables are normalized up to Third Normal Form (3NF) to eliminate redundancy, ensure data integrity, and maintain efficient querying.

#### Schema Overview

| Table Name | Fields | Data Types | Constraints |
|------------|--------|------------|-------------|
| **users** | user_id (PK), email, password_hash, role, created_at, updated_at, approval_status | UUID, VARCHAR(150), TEXT, VARCHAR(50), TIMESTAMP, TIMESTAMP, VARCHAR(20) | PK(user_id), UNIQUE(email), NOT NULL(password_hash, role), CHECK(role IN ('admin', 'alumni')) |
| **user_profiles** | profile_id (PK), user_id (FK), first_name, last_name, middle_name, program, major, graduation_year, contact_number, address, city, country, current_job, company, profile_image_url, created_at, updated_at | UUID, UUID, VARCHAR(100), VARCHAR(100), VARCHAR(100), VARCHAR(100), VARCHAR(100), INT, VARCHAR(20), TEXT, VARCHAR(100), VARCHAR(100), VARCHAR(150), VARCHAR(150), TEXT, TIMESTAMP, TIMESTAMP | PK(profile_id), FK(user_id → users.user_id), NOT NULL(first_name, last_name, program, graduation_year) |
| **pending_registrations** | pending_id (PK), email, first_name, last_name, program, graduation_year, contact_number, address, profile_image_url, status, submitted_at, reviewed_at, reviewed_by | UUID, VARCHAR(150), VARCHAR(100), VARCHAR(100), VARCHAR(100), INT, VARCHAR(20), TEXT, TEXT, VARCHAR(20), TIMESTAMP, TIMESTAMP, UUID | PK(pending_id), UNIQUE(email), CHECK(status IN ('pending', 'approved', 'rejected')) |
| **tracer_study_responses** | response_id (PK), user_id (FK), survey_year, full_name, degree, major, graduation_year, employment_status, job_title, company_name, industry, work_location, salary_range, job_search_duration, skills_acquired, program_relevance, submitted_at | UUID, UUID, INT, VARCHAR(150), VARCHAR(100), VARCHAR(100), INT, VARCHAR(100), VARCHAR(150), VARCHAR(150), VARCHAR(100), VARCHAR(150), VARCHAR(50), VARCHAR(50), TEXT, INT, TIMESTAMP | PK(response_id), FK(user_id → users.user_id), NOT NULL(survey_year, employment_status) |
| **news** | news_id (PK), title, content, author_id (FK), featured_image_url, published, created_at, updated_at | UUID, VARCHAR(200), TEXT, UUID, TEXT, BOOLEAN, TIMESTAMP, TIMESTAMP | PK(news_id), FK(author_id → users.user_id), NOT NULL(title, content) |
| **gallery_albums** | album_id (PK), title, description, cover_image_url, created_by (FK), created_at, updated_at | UUID, VARCHAR(150), TEXT, TEXT, UUID, TIMESTAMP, TIMESTAMP | PK(album_id), FK(created_by → users.user_id), NOT NULL(title) |
| **gallery_images** | image_id (PK), album_id (FK), title, description, image_url, uploaded_by (FK), uploaded_at | UUID, UUID, VARCHAR(150), TEXT, TEXT, UUID, TIMESTAMP | PK(image_id), FK(album_id → gallery_albums.album_id), FK(uploaded_by → users.user_id) |
| **job_opportunities** | job_id (PK), title, company, description, requirements, location, salary_range, employment_type, posted_by (FK), application_deadline, created_at, updated_at | UUID, VARCHAR(150), VARCHAR(150), TEXT, TEXT, VARCHAR(100), VARCHAR(50), VARCHAR(50), UUID, DATE, TIMESTAMP, TIMESTAMP | PK(job_id), FK(posted_by → users.user_id), NOT NULL(title, company, description) |
| **batchmate_messages** | message_id (PK), sender_id (FK), receiver_id (FK), subject, content, sent_at, read_at | UUID, UUID, UUID, VARCHAR(200), TEXT, TIMESTAMP, TIMESTAMP | PK(message_id), FK(sender_id → users.user_id), FK(receiver_id → users.user_id) |

#### Storage Buckets (Supabase Storage)

| Bucket Name | Purpose | Size Limit | File Types | Security Policy |
|-------------|---------|------------|------------|-----------------|
| **alumni-profiles** | Profile images | 5MB | JPG, PNG, GIF | Public read, authenticated upload |
| **gallery-images** | Photo gallery | 10MB | JPG, PNG, GIF | Public read, admin upload |
| **news-images** | News article images | 5MB | JPG, PNG, GIF | Public read, admin upload |
| **job-attachments** | Job posting files | 2MB | PDF, DOC, DOCX | Authenticated access |
| **documents** | Official documents | 10MB | PDF, DOC, DOCX | Role-based access |

#### Normalization Level Analysis

**First Normal Form (1NF):** ✅ Achieved
- All attributes contain atomic values
- No repeating groups or arrays in single columns
- Each row is uniquely identifiable

**Second Normal Form (2NF):** ✅ Achieved  
- All non-key attributes are fully functionally dependent on primary keys
- No partial dependencies exist
- Composite keys avoided where possible

**Third Normal Form (3NF):** ✅ Achieved
- No transitive dependencies
- All non-key attributes depend only on primary keys
- Separate tables for related entities (users vs user_profiles)

### 5.3.2 User Interface (UI) Design

#### Key Screen Wireframes and Descriptions

##### 1. Login/Registration Screen
```
┌─────────────────────────────────────┐
│           UIC Alumni Portal         │
│              [UIC Logo]             │
├─────────────────────────────────────┤
│  Email:    [________________]       │
│  Password: [________________]       │
│            [Login Button]           │
│                                     │
│  Don't have an account?             │
│  [Register as Alumni]               │
│                                     │
│  [Forgot Password?]                 │
└─────────────────────────────────────┘
```
**Description:** Clean, institutional-branded login with UIC maroon/gold theme. Includes registration link and password recovery option.

##### 2. Alumni Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ [UIC Logo] Alumni Portal    [Profile] [Notifications] [Logout] │
├─────────────────────────────────────────────────────────┤
│ Welcome back, [Alumni Name]!                            │
├─────────────────────────────────────────────────────────┤
│ ┌─Quick Actions─┐ ┌─Recent News─────┐ ┌─Upcoming Events┐ │
│ │ • Update Profile│ │ • New Job Postings│ │ • Alumni Reunion │ │
│ │ • Tracer Study  │ │ • CCS Updates    │ │ • Career Fair   │ │
│ │ • Find Batchmates│ │ • Success Stories│ │ • Webinar Series│ │
│ └───────────────┘ └─────────────────┘ └───────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ┌─Employment Stats─────────────────────────────────────┐ │
│ │     [Employment Rate Chart]                         │ │
│ │     Current Status: [Employed/Unemployed/Student]   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```
**Description:** Personalized dashboard with quick access to key features, news feed, and employment statistics visualization.

##### 3. Admin Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ [UIC Logo] Admin Portal              [Profile] [Logout] │
├─────────────────────────────────────────────────────────┤
│ ┌─Pending Approvals─┐ ┌─System Stats──┐ ┌─Quick Actions┐ │
│ │ [5] New Registrations│ │ Total Alumni: 1,234│ │ • Manage Users │ │
│ │ [2] Profile Updates  │ │ Active: 987       │ │ • Create News  │ │
│ │ [Review All]        │ │ Tracer Responses: │ │ • View Reports │ │
│ └───────────────────┘ │ 456 (37%)         │ │ • Export Data  │ │
│                       └───────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ┌─Analytics Dashboard─────────────────────────────────────┐ │
│ │ [Employment Rate Chart] [Graduation Year Distribution] │ │
│ │ [Industry Breakdown]    [Geographic Distribution]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```
**Description:** Comprehensive admin interface with approval workflow, system statistics, and analytics dashboard.

##### 4. Tracer Study Form
```
┌─────────────────────────────────────────────────────────┐
│                    Tracer Study Survey                  │
├─────────────────────────────────────────────────────────┤
│ Personal Information                                    │
│ Full Name: [________________________]                  │
│ Program: [Computer Science ▼] Major: [____________]     │
│ Graduation Year: [2023 ▼]                             │
├─────────────────────────────────────────────────────────┤
│ Employment Information                                  │
│ Current Status: [Employed (Full-time) ▼]               │
│ Job Title: [_________________________]                 │
│ Company: [___________________________]                 │
│ Industry: [Technology ▼]                               │
│ Salary Range: [₱50,001 - ₱75,000 ▼]                   │
├─────────────────────────────────────────────────────────┤
│ Program Evaluation                                      │
│ Relevance to Job: [●●●●○] Very Relevant               │
│ Skills Acquired: [☑] Programming [☑] Problem Solving   │
│                 [☑] Communication [☐] Leadership       │
├─────────────────────────────────────────────────────────┤
│              [Save Draft] [Submit Survey]               │
└─────────────────────────────────────────────────────────┘
```
**Description:** Multi-section form with auto-save functionality, dropdown selections, and progress indicators.

##### 5. AI Chatbot Interface
```
┌─────────────────────────────────────┐
│ 🤖 CCS Alumni Assistant             │
├─────────────────────────────────────┤
│ Bot: Hello! I can help you with     │
│      alumni data and statistics.    │
│                                     │
│ You: What's the employment rate?    │
│                                     │
│ Bot: Based on current tracer study  │
│      data, 87% of CCS graduates     │
│      are employed. Would you like   │
│      more details by program?       │
│                                     │
│ Suggested Questions:                │
│ • Industry breakdown               │
│ • Salary statistics                │
│ • Career progression trends        │
├─────────────────────────────────────┤
│ [Type your question...        ] [→] │
└─────────────────────────────────────┘
```
**Description:** Contextual AI assistant with suggested questions and real-time responses based on tracer study data.

### 5.3.3 Module Design

#### Class Diagram (Core System Classes)

```
┌─────────────────────┐       ┌─────────────────────┐
│       User          │1    1 │    UserProfile      │
├─────────────────────┤       ├─────────────────────┤
│ -user_id: UUID      │◄─────►│ -profile_id: UUID   │
│ -email: string      │       │ -user_id: UUID      │
│ -password_hash: str │       │ -first_name: string │
│ -role: string       │       │ -last_name: string  │
│ -approval_status    │       │ -program: string    │
│ -created_at: date   │       │ -graduation_year    │
├─────────────────────┤       │ -contact_number     │
│ +authenticate()     │       │ -profile_image_url  │
│ +updateProfile()    │       ├─────────────────────┤
│ +changePassword()   │       │ +updateProfile()    │
└─────────────────────┘       │ +uploadImage()      │
                              └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│   TracerResponse    │*    1 │       User          │
├─────────────────────┤       │                     │
│ -response_id: UUID  │◄─────►│                     │
│ -user_id: UUID      │       │                     │
│ -survey_year: int   │       │                     │
│ -employment_status  │       │                     │
│ -job_title: string  │       │                     │
│ -company_name: str  │       │                     │
│ -salary_range: str  │       │                     │
├─────────────────────┤       │                     │
│ +submitResponse()   │       │                     │
│ +updateResponse()   │       │                     │
│ +generateReport()   │       │                     │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      NewsArticle    │*    1 │       User          │
├─────────────────────┤       │     (Admin)         │
│ -news_id: UUID      │◄─────►│                     │
│ -title: string      │       │                     │
│ -content: text      │       │                     │
│ -author_id: UUID    │       │                     │
│ -published: boolean │       │                     │
│ -created_at: date   │       │                     │
├─────────────────────┤       │                     │
│ +publish()          │       │                     │
│ +unpublish()        │       │                     │
│ +updateContent()    │       │                     │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────┐
│    OllamaService    │
├─────────────────────┤
│ -baseURL: string    │
│ -model: string      │
│ -conversation: []   │
├─────────────────────┤
│ +checkConnection()  │
│ +sendMessage()      │
│ +generateContext()  │
│ +streamResponse()   │
└─────────────────────┘
```

#### Sequence Diagram: Tracer Study Submission Flow

```
Alumni    UI Component    Supabase API    Database    Analytics
  │           │               │             │            │
  │ 1. Open   │               │             │            │
  │ Survey    │               │             │            │
  ├──────────►│               │             │            │
  │           │ 2. Load Form  │             │            │
  │           │ Data          │             │            │
  │           ├──────────────►│             │            │
  │           │               │ 3. Fetch    │            │
  │           │               │ User Profile│            │
  │           │               ├────────────►│            │
  │           │               │◄────────────┤            │
  │           │◄──────────────┤             │            │
  │ 4. Fill   │               │             │            │
  │ Survey    │               │             │            │
  ├──────────►│               │             │            │
  │           │ 5. Validate   │             │            │
  │           │ Input         │             │            │
  │           │ 6. Submit     │             │            │
  │           │ Response      │             │            │
  │           ├──────────────►│             │            │
  │           │               │ 7. Insert   │            │
  │           │               │ Response    │            │
  │           │               ├────────────►│            │
  │           │               │◄────────────┤            │
  │           │               │ 8. Trigger  │            │
  │           │               │ Analytics   │            │
  │           │               │ Update      │            │
  │           │               ├─────────────────────────►│
  │           │◄──────────────┤             │            │
  │ 9. Show   │               │             │            │
  │ Success   │               │             │            │
  │◄──────────┤               │             │            │
```

#### Sequence Diagram: AI Chatbot Interaction

```
User      ChatBot UI    OllamaService    Tracer Data    AI Model
  │           │              │               │            │
  │ 1. Ask    │              │               │            │
  │ Question  │              │               │            │
  ├──────────►│              │               │            │
  │           │ 2. Process   │               │            │
  │           │ Message      │               │            │
  │           ├─────────────►│               │            │
  │           │              │ 3. Generate  │            │
  │           │              │ Context      │            │
  │           │              ├──────────────►│            │
  │           │              │◄──────────────┤            │
  │           │              │ 4. Send to   │            │
  │           │              │ AI Model     │            │
  │           │              ├─────────────────────────►│
  │           │              │              │ 5. Process│
  │           │              │              │ & Generate│
  │           │              │◄─────────────────────────┤
  │           │◄─────────────┤               │            │
  │ 6. Display│              │               │            │
  │ Response  │              │               │            │
  │◄──────────┤              │               │            │
```

### 5.3.4 Security Design

The CCS Alumni Portal implements a comprehensive security framework prioritizing data confidentiality, integrity, and availability.

#### Authentication & Authorization

**Multi-Factor Authentication:**
- Primary: Email/Password with Supabase Auth
- Secondary: Email OTP verification for sensitive operations
- JWT tokens with automatic refresh (24-hour expiry)
- Session management with secure cookie storage

**Role-Based Access Control (RBAC):**
```sql
-- User Roles Hierarchy
ADMIN (Full system access)
├── User management (CRUD)
├── Content management (News, Jobs, Gallery)
├── System analytics and reports
└── Approval workflows

ALUMNI (Limited access)
├── Personal profile management
├── Tracer study participation
├── Batchmate communication
└── Read-only access to news/events
```

#### Data Protection

**Encryption Standards:**
- **In Transit:** TLS 1.3 for all HTTP communications
- **At Rest:** AES-256 encryption for sensitive data
- **File Storage:** Encrypted Supabase Storage buckets
- **Database:** PostgreSQL native encryption

**Row-Level Security (RLS) Policies:**
```sql
-- Alumni can only access their own data
CREATE POLICY "alumni_own_data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY "admin_full_access" ON user_profiles
  FOR ALL USING (is_admin(auth.uid()));

-- Public read access for approved content
CREATE POLICY "public_news_read" ON news
  FOR SELECT USING (published = true);
```

#### Input Validation & Sanitization

**Client-Side Validation:**
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

// File upload validation
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxFileSize = 5 * 1024 * 1024; // 5MB
```

**Server-Side Validation:**
- SQL injection prevention via parameterized queries
- XSS protection through content sanitization
- CSRF protection with token validation
- Rate limiting on API endpoints

#### Audit Logging & Monitoring

**Security Event Logging:**
```sql
CREATE TABLE security_logs (
  log_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT true
);
```

**Monitored Events:**
- Failed login attempts (3+ triggers account lockout)
- Administrative actions (user approval, data modification)
- File uploads and downloads
- Sensitive data access (salary information, personal details)
- System configuration changes

#### Backup & Recovery Security

**Encrypted Backups:**
- Daily automated database backups with AES-256 encryption
- 30-day retention policy with secure off-site storage
- Point-in-time recovery capabilities
- Backup integrity verification

**Disaster Recovery:**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Automated failover procedures
- Regular disaster recovery testing

### 5.3.5 System Environment and Technology Stack

#### Development Environment

**Hardware Requirements:**
- **Minimum:** Intel i5 CPU, 16GB RAM, 256GB SSD
- **Recommended:** Intel i7 CPU, 32GB RAM, 512GB NVMe SSD
- **Network:** Stable internet connection (minimum 10 Mbps)

**Operating Systems:**
- **Primary:** Windows 11 Pro (current development environment)
- **Secondary:** Ubuntu 22.04 LTS (Linux alternative)
- **macOS:** Monterey 12.0+ (cross-platform compatibility)

**Development Tools:**
```
IDE: Visual Studio Code with extensions:
├── ES7+ React/Redux/React-Native snippets
├── Prettier - Code formatter
├── ESLint
├── GitLens
├── Thunder Client (API testing)
└── Supabase Snippets

Version Control: Git + GitHub
├── Feature branch workflow
├── Pull request reviews
├── Automated CI/CD with GitHub Actions
└── Issue tracking and project management

Design Tools:
├── Figma (UI/UX design and prototyping)
├── Canva (Marketing materials)
└── Draw.io (System diagrams)
```

#### Technology Stack Specification

**Frontend Technologies:**
```javascript
Core Framework: React 18.2.0
├── React Router DOM 6.3.0 (Client-side routing)
├── React Context API (State management)
├── React Hooks (Component logic)
└── React.memo (Performance optimization)

UI/UX Libraries:
├── Chart.js 4.3.0 + React-ChartJS-2 5.2.0 (Data visualization)
├── React Icons 4.10.1 (Icon library)
├── React Dropzone 14.2.3 (File uploads)
├── React Toastify 9.1.3 (Notifications)
└── Custom CSS3 with Flexbox/Grid (Responsive design)

Utilities:
├── Axios 1.4.0 (HTTP client)
├── Moment.js 2.29.4 + date-fns 4.1.0 (Date handling)
├── jsPDF 3.0.2 + jsPDF-AutoTable 5.0.2 (PDF generation)
└── React Scripts 5.0.1 (Build tooling)
```

**Backend Technologies:**
```javascript
Backend-as-a-Service: Supabase
├── PostgreSQL 15+ (Primary database)
├── Supabase Auth (Authentication service)
├── Supabase Storage (File management)
├── Supabase Realtime (WebSocket connections)
└── Edge Functions (Serverless computing)

AI Integration: Ollama
├── Local LLM hosting (localhost:11434)
├── Model support: llama3.2:1b, llama3.2:3b, llama3.1:8b
├── Contextual AI responses
└── Conversation history management
```

**Database Configuration:**
```sql
Database: Supabase PostgreSQL
├── Version: 15.x
├── Connection pooling: PgBouncer
├── Backup frequency: Daily automated
├── Security: Row Level Security (RLS) enabled
└── Extensions: uuid-ossp, pgcrypto, pg_stat_statements

Storage Buckets:
├── alumni-profiles (5MB limit, public read)
├── gallery-images (10MB limit, public read)
├── documents (10MB limit, authenticated access)
└── news-images (5MB limit, public read)
```

#### Production Environment Specification

**Cloud Infrastructure:**
```
Hosting Platform: Vercel (Frontend) + Supabase Cloud (Backend)
├── Frontend: Static site deployment with CDN
├── Backend: Managed Supabase infrastructure
├── Database: Multi-region PostgreSQL cluster
└── Storage: Distributed file storage with CDN

Alternative Deployment:
├── AWS EC2 (Application servers)
├── AWS RDS PostgreSQL (Database)
├── AWS S3 (File storage)
├── CloudFlare (CDN and DDoS protection)
└── Docker containers (Containerized deployment)
```

**Performance & Scalability:**
```
Auto-scaling Configuration:
├── Frontend: CDN caching with 99.9% uptime SLA
├── Database: Connection pooling (max 100 connections)
├── Storage: Automatic backup and replication
└── Monitoring: Real-time performance metrics

Load Balancing:
├── Geographic distribution via CDN
├── Database read replicas for query optimization
├── Automatic failover for high availability
└── Rate limiting (100 requests/minute per user)
```

**Monitoring & DevOps:**
```
CI/CD Pipeline: GitHub Actions
├── Automated testing on pull requests
├── Code quality checks (ESLint, Prettier)
├── Security scanning (npm audit, Snyk)
├── Automated deployment to staging/production
└── Rollback capabilities

Monitoring Stack:
├── Application: Supabase Dashboard + Custom analytics
├── Performance: Web Vitals monitoring
├── Errors: React ErrorBoundary + Console logging
├── Uptime: Pingdom/UptimeRobot
└── Security: Automated vulnerability scanning
```

**Security Infrastructure:**
```
Network Security:
├── HTTPS everywhere (TLS 1.3)
├── CORS configuration for API access
├── Rate limiting and DDoS protection
└── IP whitelisting for admin functions

Data Security:
├── Encryption at rest (AES-256)
├── Encryption in transit (TLS 1.3)
├── Regular security audits
├── Penetration testing (quarterly)
└── Compliance with data protection regulations
```

---

*Document Version: 1.0*  
*Last Updated: September 19, 2025*  
*Prepared for: University of the Immaculate Conception - College of Computer Studies*
