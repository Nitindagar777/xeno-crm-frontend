import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthLayout from './pages/AuthLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Workspace from './pages/Workspace';
import MessageHistory from './pages/MessageHistory';
import Spinner from './components/ui/Spinner';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center p-6 space-y-4">
    <h2 className="text-4xl font-extrabold text-primary tracking-tight">404</h2>
    <div className="space-y-1">
      <h4 className="text-lg font-bold text-text-primary">Page Not Found</h4>
      <p className="text-xs text-text-secondary">The page you are looking for does not exist or has been moved.</p>
    </div>
    <Link to="/dashboard" className="btn-primary text-xs py-2.5">
      Return to Dashboard
    </Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      {/* Shared Auth Layout to preserve left panel stability */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Main Workspace Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/segments" element={<Segments />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/history" element={<MessageHistory />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/workspace" replace />} />
    </Routes>
  );
}
