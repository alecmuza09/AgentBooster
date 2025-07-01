import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import Leads from './pages/Leads';
import { Clients } from './pages/Clients';
import { Policies } from './pages/Policies';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';
import { Learning } from './pages/Learning';
import Settings from './pages/Settings';
import { Finanzas360 } from './pages/Finanzas360';
import { Admin } from './pages/Admin';
import { CourseDetailAdmin } from './pages/CourseDetailAdmin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="clients" element={<Clients />} />
              <Route path="policies" element={<Policies />} />
              <Route path="documents" element={<Documents />} />
              <Route path="reports" element={<Reports />} />
              <Route path="learning" element={<Learning />} />
              <Route path="finanzas-360" element={<Finanzas360 />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<Admin />} />
              <Route path="admin/course/:id" element={<CourseDetailAdmin />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;