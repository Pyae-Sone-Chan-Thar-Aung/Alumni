import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import News from './pages/News';
import Login from './pages/Login';
import Register from './pages/Register';
import AlumniDashboard from './pages/AlumniDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import JobOpportunities from './pages/JobOpportunities';
import Batchmates from './pages/Batchmates';
import AdminUsers from './pages/AdminUsers';
import AdminNews from './pages/AdminNews';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthProvider value={{ isAuthenticated, user, login, logout }}>
      <div className="App">
        <Navbar />
        
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Alumni Routes */}
            <Route 
              path="/alumni-dashboard" 
              element={isAuthenticated && user?.role === 'alumni' ? <AlumniDashboard /> : <Navigate to="/login" />} 
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
    </AuthProvider>
  );
}

export default App; 