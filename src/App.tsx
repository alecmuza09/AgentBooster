import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load de las páginas para optimizar la carga inicial
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Leads = React.lazy(() => import('./pages/Leads'));
const Clients = React.lazy(() => import('./pages/Clients').then(module => ({ default: module.Clients })));
const Policies = React.lazy(() => import('./pages/Policies').then(module => ({ default: module.Policies })));
const Reports = React.lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Marketing = React.lazy(() => import('./pages/Marketing'));
const Email = React.lazy(() => import('./pages/Email').then(module => ({ default: module.Email })));
const Documents = React.lazy(() => import('./pages/Documents').then(module => ({ default: module.Documents })));
const Learning = React.lazy(() => import('./pages/Learning').then(module => ({ default: module.Learning })));
const Settings = React.lazy(() => import('./pages/Settings'));
const Finanzas360 = React.lazy(() => import('./pages/Finanzas360'));


function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="policies" element={<Policies />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="email" element={<Email />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="finanzas-360" element={<Finanzas360 />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" />} /> 
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;