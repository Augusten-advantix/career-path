import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import Roadmap from './pages/Roadmap';
import ProfileReview from './pages/ProfileReview';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/review" element={
            <PrivateRoute>
              <ProfileReview />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
