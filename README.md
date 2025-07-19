# UIC Alumni Portal System

A comprehensive web-based alumni portal system for the University of the Immaculate Conception, Davao City. This system provides alumni registration, news and announcements, job opportunities, batchmate connections, and admin management features.

## Features

### Public Features
- **Home Page**: Welcome page with university information and featured news
- **News & Announcements**: Publicly accessible news and announcements
- **Registration**: Alumni registration with comprehensive form
- **Login**: Secure authentication system

### Alumni Features
- **Dashboard**: Personalized alumni dashboard
- **Profile Management**: Complete profile with image upload
- **Job Opportunities**: Browse and post job opportunities by field
- **Batchmates**: Connect with fellow batchmates and share messages
- **Chatbot**: AI-powered assistant for quick information

### Admin Features
- **User Management**: Approve/reject alumni registrations
- **News Management**: Create and manage news and announcements
- **Dashboard**: Analytics and statistics
- **Statistics**: Charts showing alumni demographics and engagement

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Chart.js**: Data visualization
- **React Icons**: Icon library
- **React Toastify**: Notifications
- **React Dropzone**: File uploads

### Backend
- **Laravel 10**: PHP framework
- **Laravel Sanctum**: API authentication
- **MySQL**: Database
- **Laravel Migrations**: Database schema management

### Design
- **Custom CSS**: Responsive design with CSS Grid and Flexbox
- **Theme Colors**: Pink (#e91e63), Light Pink (#fce4ec), Navy Blue (#1a237e)

## Project Structure

```
uic-alumni-portal/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── context/           # React context
│   └── index.css          # Global styles
├── backend/               # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── database/migrations/
│   └── routes/api.php
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- PHP 8.1+
- Composer
- MySQL 8.0+
- XAMPP/WAMP/LAMP stack

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure database in .env**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=uic_alumni_portal
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

5. **Generate application key**:
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**:
   ```bash
   php artisan migrate
   ```

7. **Seed database with sample data**:
   ```bash
   php artisan db:seed
   ```

8. **Start Laravel server**:
   ```bash
   php artisan serve
   ```

### Database Setup

1. **Create MySQL database**:
   ```sql
   CREATE DATABASE uic_alumni_portal;
   ```

2. **Run migrations**:
   ```bash
   php artisan migrate
   ```

## Usage

### Demo Accounts

**Admin Account**:
- Email: admin@uic.edu.ph
- Password: password123

**Alumni Account**:
- Email: alumni@uic.edu.ph
- Password: password123

### Key Features Walkthrough

1. **Registration**: New alumni can register with comprehensive information
2. **Admin Approval**: Admins can approve/reject registrations
3. **News Management**: Admins can post news and announcements
4. **Job Opportunities**: Users can browse and post jobs by field
5. **Batchmates**: Alumni can connect with their batch groups
6. **Chatbot**: AI assistant for quick information access

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### News
- `GET /api/news` - Get all news
- `GET /api/news/{id}` - Get specific news
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/{id}` - Update news (admin only)
- `DELETE /api/news/{id}` - Delete news (admin only)

### Job Opportunities
- `GET /api/job-opportunities` - Get all jobs
- `GET /api/job-opportunities/{id}` - Get specific job
- `POST /api/job-opportunities` - Create job posting
- `PUT /api/job-opportunities/{id}` - Update job
- `DELETE /api/job-opportunities/{id}` - Delete job

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/approve` - Approve user
- `PUT /api/admin/users/{id}/reject` - Reject user
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/statistics` - Get statistics

## Database Schema

### Users Table
- Basic info (name, email, password)
- Academic info (batch, course, graduation year)
- Professional info (job, company)
- Address info
- Role and status

### News Table
- Title, content, category
- Author, image
- Important flag and published status

### Job Opportunities Table
- Title, description, company
- Location, field, type
- Contact information and deadline

### Batch Groups Table
- Batch year and name
- Description and image

### Batch Messages Table
- Message content and type
- User and batch group relationships

## Customization

### Theme Colors
The system uses a custom color scheme:
- Primary Pink: `#e91e63`
- Light Pink: `#fce4ec`
- Navy Blue: `#1a237e`

### Adding New Features
1. Create React components in `src/components/`
2. Add pages in `src/pages/`
3. Create Laravel controllers in `backend/app/Http/Controllers/`
4. Add routes in `backend/routes/api.php`
5. Create migrations for new database tables

## Deployment

### Frontend Deployment
1. Build the React app:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your web server

### Backend Deployment
1. Upload Laravel files to server
2. Set up environment variables
3. Run migrations: `php artisan migrate`
4. Configure web server (Apache/Nginx)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**University of the Immaculate Conception, Davao City**
*Empowering minds, Building futures* 