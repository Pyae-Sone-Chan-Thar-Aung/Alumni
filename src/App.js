import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
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

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();
  const [showChatbot, setShowChatbot] = useState(false);

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
          <Route path="/news" element={<News />} />
          <Route path="/gallery" element={<Gallery />} />
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
            element={isAuthenticated && user?.role === 'admin' ? <AdminNews /> : <Navigate to="/login" />} 
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
            path="/admin/jobs" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminJobs /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/analytics" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminAnalytics /> : <Navigate to="/" />} 
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