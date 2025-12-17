import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ToastContext';
import RecruiterLanding from './pages/RecruiterLanding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileDetail from './pages/ProfileDetail';
import JobQuestionnaire from './pages/JobQuestionnaire';
import PositionPage from './pages/Position';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        <Route path="/" element={<RecruiterLanding />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/job-questionnaire" element={
                            <PrivateRoute>
                                <JobQuestionnaire />
                            </PrivateRoute>
                        } />
                        <Route path="/profile/:id" element={
                            <PrivateRoute>
                                <ProfileDetail />
                            </PrivateRoute>
                        } />
                        <Route path="/position/:id" element={
                            <PrivateRoute>
                                <PositionPage />
                            </PrivateRoute>
                        } />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
};

export default App;
