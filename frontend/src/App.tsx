import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import Roadmap from './pages/Roadmap';
import StepDetail from './pages/StepDetail';
import ProfileReview from './pages/ProfileReview';
import Conversation from './pages/Conversation';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProfileManagement from './pages/admin/ProfileManagement';
import AnalysisJobMonitoring from './pages/admin/AnalysisJobMonitoring';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/review" element={
              <PrivateRoute>
                <ProfileReview />
              </PrivateRoute>
            } />
            <Route path="/conversation" element={
              <PrivateRoute>
                <Conversation />
              </PrivateRoute>
            } />
            <Route path="/questionnaire" element={
              <PrivateRoute>
                <Questionnaire />
              </PrivateRoute>
            } />
            <Route path="/roadmap" element={
              <PrivateRoute>
                <Roadmap />
              </PrivateRoute>
            } />
            <Route path="/roadmap/step/:stepIndex" element={
              <PrivateRoute>
                <StepDetail />
              </PrivateRoute>
            } />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            <Route path="/admin/profiles" element={
              <AdminRoute>
                <ProfileManagement />
              </AdminRoute>
            } />
            <Route path="/admin/jobs" element={
              <AdminRoute>
                <AnalysisJobMonitoring />
              </AdminRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
