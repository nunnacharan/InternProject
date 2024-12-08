import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import PowerUserDashboard from './components/PowerUserDashboard';
import OnboardingForm from './components/OnboardingForm';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import CandidateDetails from './components/CandidateDetails';
import Profile from './components/Profile';
import SuccessPage from './components/SuccessPage';
import PowerCandidateDetails from './components/PowerCandidateDetails';
import UserDetails from './components/UserDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user-dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/onboard" element={<OnboardingForm />} />
          <Route path="/candidate-details" element={<CandidateDetails />} />
          <Route path="/power-candidate-details" element={<PowerCandidateDetails />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route 
            path="/power-user-dashboard" 
            element={
              <ProtectedRoute>
                <PowerUserDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
