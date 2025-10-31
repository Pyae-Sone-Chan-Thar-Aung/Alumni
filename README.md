# 🎓 CCS Alumni Portal - University of the Immaculate Conception

A comprehensive, modern alumni portal system for the College of Computer Studies at the University of the Immaculate Conception, Davao City. Built with React.js and Supabase, featuring the official UIC logo and branding.

## ✅ System Status: **PRODUCTION READY**

**Version**: 1.0.0  
**Last Updated**: September 23, 2025  
**Deployment Status**: Ready for Production Deployment

## 🎨 Complete Feature Set

### 🎓 For Alumni
- **Registration & Approval**: Secure registration with admin approval workflow
- **Profile Management**: Complete profile with image upload and professional details
- **Alumni Dashboard**: Personalized dashboard with recent activities and quick access
- **Job Opportunities**: Browse and apply for jobs across various fields
- **News & Updates**: Stay updated with university news and announcements
- **Gallery**: View college events and activities photo gallery
- **Batchmates Directory**: Connect with fellow alumni from your batch
- **Tracer Study**: Submit employment and career progression data
- **AI Chatbot**: Intelligent assistance with tracer study insights (Ollama integration)

### 👨‍💼 For Administrators
- **Admin Dashboard**: Comprehensive overview with statistics and analytics charts
- **User Management**: Manage alumni accounts, approvals, and registrations
- **Pending Registrations**: Review and approve/reject new alumni applications
- **News Management**: Create, edit, and publish news articles with categories
- **Gallery Management**: Upload and organize event photos in albums
- **Job Posting**: Post and manage job opportunities for alumni
- **Tracer Study Analytics**: View detailed employment statistics and trends
- **System Analytics**: Monitor user activity and system performance

### 🔧 Technical Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Official UIC Branding**: Integrated UIC logo and official color scheme
- **Secure Authentication**: JWT-based authentication with role-based access
- **File Upload System**: Profile images and gallery photos with Supabase storage
- **Real-time Updates**: Live data synchronization across all components
- **AI Integration**: Smart chatbot with fallback system for offline operation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pyae-Sone-Chan-Thar-Aung/Alumni.git
   cd Alumni
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Setup (Supabase - Free)

This project uses Supabase as the free online database. Follow these steps to set up:

### 1. Create Supabase Account
- Go to [https://supabase.com](https://supabase.com)
- Sign up for a free account
- Create a new project

### 2. Get Your Credentials
- Go to Settings > API in your Supabase dashboard
- Copy your Project URL and anon key

### 3. Set Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL= ******
REACT_APP_SUPABASE_ANON_KEY= ******
```

### 4. Set Up Database Tables
Run the SQL commands from `src/config/database.js` in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'alumni' CHECK (role IN ('admin', 'alumni')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  batch_year INTEGER,
  course VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add more tables as needed...
```

## 🎨 Theme Colors

The application uses UIC's official colors:
- **Primary Maroon**: #8B0000
- **Dark Maroon**: #660000
- **Gold**: #FFD700
- **Light Gold**: #FFF8DC
- **Cream**: #F5F5DC

## 📱 Responsive Design

The portal is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones


## 🔒 Security Features

- JWT token authentication
- Protected routes
- Role-based access control
- Secure password handling
- Input validation

## 🚀 Production Deployment

### Deployment Options

#### Option 1: Netlify (Recommended)
1. Push your code to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables in Netlify dashboard

#### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

#### Option 3: Traditional Web Server
1. Run `build-production.bat`
2. Upload `build` folder contents to your web server
3. Configure server to serve `index.html` for all routes
4. Set up SSL certificate

### Post-Deployment Checklist
- [ ] All features working correctly
- [ ] Database connections established
- [ ] File uploads functional
- [ ] Admin approval workflow operational
- [ ] AI chatbot responding (if Ollama configured)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions:
- Email: *******
- Phone: ******

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- University of the Immaculate Conception, Davao City
- React.js community
- Supabase for the free database service
- All contributors and alumni

---

**Made with ❤️ for UIC Alumni**
