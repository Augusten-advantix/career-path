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

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
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
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
