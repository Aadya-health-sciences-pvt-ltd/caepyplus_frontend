import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from "./layouts/MainLayout";
import Login from './pages/Login';
import ResumeUpload from './pages/ResumeUpload';
import Onboarding from './pages/Onboarding';
import ReviewProfile from './pages/ReviewProfile';
import ProfileSubmitted from './pages/ProfileSubmitted';
import ProfileView from './pages/ProfileView';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctorsList from './pages/admin/AdminDoctorsList';
import AdminDoctorDetails from './pages/admin/AdminDoctorDetails';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMasters from './pages/admin/AdminMasters';
import AdminLogin from './pages/admin/AdminLogin';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      document.title = 'CAEPY ADMIN';
    } else {
      document.title = 'CAEPY';
    }
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/resume-upload" element={<ProtectedRoute><PageTransition><ResumeUpload /></PageTransition></ProtectedRoute>} />


          {/* Admin Routes */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="doctors" element={<PageTransition><AdminDoctorsList /></PageTransition>} />
            <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
            <Route path="masters" element={<PageTransition><AdminMasters /></PageTransition>} />
            <Route path="doctor/:id" element={<PageTransition><AdminDoctorDetails /></PageTransition>} />
            <Route path="settings" element={<PageTransition><div style={{ padding: '2rem' }}>Settings Placeholder</div></PageTransition>} />
          </Route>

          {/* Protected Routes with Header */}
          <Route element={<MainLayout />}>
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute><PageTransition><ReviewProfile /></PageTransition></ProtectedRoute>} />
            <Route path="/submitted" element={<ProtectedRoute><PageTransition><ProfileSubmitted /></PageTransition></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfileView /></PageTransition></ProtectedRoute>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
