import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from './config/supabaseClient';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import NewsGallery from './pages/NewsGallery';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AlumniDashboard from './pages/AlumniDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AlumniProfile from './pages/AlumniProfile';
import JobOpportunities from './pages/JobOpportunities';
import Batchmates from './pages/Batchmates';
import Messages from './pages/Messages';
import AdminUsers from './pages/AdminUsers';
import AdminNews from './pages/AdminNews';
import AdminPendingRegistrations from './pages/AdminPendingRegistrations';
import TracerStudy from './pages/TracerStudy';
import AdminTracerStudy from './pages/AdminTracerStudy';
import Gallery from './pages/Gallery';
import AdminGallery from './components/gallery/AdminGallery';
import AdminJobs from './pages/AdminJobs';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminInternalNews from './pages/AdminInternalNews';
import AdminTracerBuilder from './pages/AdminTracerBuilder';
import AdminGeocode from './pages/AdminGeocode';
import ProfessionalDevelopmentEvents from './pages/ProfessionalDevelopmentEvents';
import AdminProfessionalDevelopment from './pages/AdminProfessionalDevelopment';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  // Handle email confirmation
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if this is an email confirmation redirect
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'signup') {
        console.log('Processing email confirmation...');
        
        try {
          // Get the user session
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);
          
          if (error) throw error;
          
          if (user) {
            console.log('Email confirmed successfully for:', user.email);
            toast.success('Email confirmed successfully! Please wait for admin approval.');
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect to login page
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } catch (error) {
          console.error('Email confirmation error:', error);
          toast.error('Failed to confirm email. Please try again.');
        }
      }
    };
    
    handleEmailConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        message="Loading UIC Alumni Portal..." 
        fullscreen={true}
      />
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsGallery />} />
          <Route path="/gallery" element={<NewsGallery />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/alumni-profile'} /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/alumni-profile'} /> : <Register />
          } />
          <Route path="/forgot-password" element={
            isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/alumni-profile'} /> : <ForgotPassword />
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected Alumni Routes */}
          <Route 
            path="/alumni-dashboard" 
            element={isAuthenticated && user?.role === 'alumni' ? <AlumniDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/alumni-profile" 
            element={isAuthenticated && user?.role === 'alumni' ? <AlumniProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/job-opportunities" 
            element={isAuthenticated ? <JobOpportunities /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/batchmates" 
            element={isAuthenticated ? <Batchmates /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/messages" 
            element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/tracer-study" 
            element={isAuthenticated ? <TracerStudy /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/professional-development" 
            element={isAuthenticated ? <ProfessionalDevelopmentEvents /> : <Navigate to="/login" />} 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin-dashboard" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/users" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/news" 
            element={isAuthenticated && (user?.role === 'admin' || user?.role === 'coordinator') ? <AdminInternalNews /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/pending-registrations" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminPendingRegistrations /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/gallery" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminGallery /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/tracer-study" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminTracerStudy /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/tracer-builder" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminTracerBuilder /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/jobs" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminJobs /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/professional-development" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminProfessionalDevelopment /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/analytics" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminAnalytics /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/geocode" 
            element={isAuthenticated && (user?.role === 'admin' || user?.role === 'coordinator') ? <AdminGeocode /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>

      <Footer />
      
      {/* Chatbot */}
      {isAuthenticated && (
        <Chatbot 
          isOpen={showChatbot}
          onToggle={() => setShowChatbot(!showChatbot)}
        />
      )}
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 