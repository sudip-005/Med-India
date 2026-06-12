import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Dashboard } from './pages/Dashboard';

// Patient pages
import { PatientProfile } from './pages/Patient/PatientProfile';
import { Prescriptions } from './pages/Patient/Prescriptions';
import { DoctorSearch } from './pages/Patient/DoctorSearch';
import { Cart } from './pages/Patient/Cart';
import { Checkout } from './pages/Patient/Checkout';
import { Orders } from './pages/Patient/Orders';

// Doctor pages
import { DoctorProfile } from './pages/Doctor/DoctorProfile';

// Retailer pages
import { RetailerProfile } from './pages/Retailer/RetailerProfile';

import { Activity, Shield, Stethoscope, Store, CheckCircle, Heart, ArrowRight, ShoppingCart } from 'lucide-react';
import './App.css';

// Guard for protected routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Guard for public routes (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Landing / Home page
const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      
      {/* Hero Section */}
      <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          <Heart size={16} fill="var(--primary)" /> Smart Healthcare Platform
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
          Your Local Healthcare <br />
          <span style={{ color: 'var(--primary)' }}>Marketplace</span> & <span style={{ color: 'var(--secondary)' }}>Consultations</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
          Order medicines directly from certified local retail pharmacies and get online consultation support from verified medical specialists.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}>
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}>
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-3" style={{ maxWidth: '1000px', margin: '0 auto', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <ShoppingCart size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Easy Online Pharmacy</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Add prescribed medicines to your cart, upload prescription slips, and order with Cash on Delivery from verified local retailers.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>
          <div style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', width: 'fit-content', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <Stethoscope size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Verified Medical Doctors</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Browse active doctor profiles, filter by specialization, and consult expert clinicians verified by medical certificate registrations.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-main)', width: 'fit-content', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <Store size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Digital Pharmacy Stores</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Local retailer merchants can upload inventory stock CSV files to quickly list their medicines catalog and manage orders.
          </p>
        </div>
      </div>

    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Route */}
          <Route path="/" element={<Layout><Home /></Layout>} />

          {/* Authentication Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Core Dashboard Router */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['PATIENT']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['PATIENT']}><DoctorSearch /></ProtectedRoute>} />
          <Route path="/patient/cart" element={<ProtectedRoute allowedRoles={['PATIENT']}><Cart /></ProtectedRoute>} />
          <Route path="/patient/checkout" element={<ProtectedRoute allowedRoles={['PATIENT']}><Checkout /></ProtectedRoute>} />
          <Route path="/patient/orders" element={<ProtectedRoute allowedRoles={['PATIENT', 'RETAILER']}><Orders /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorProfile /></ProtectedRoute>} />

          {/* Retailer Routes */}
          <Route path="/retailer/profile" element={<ProtectedRoute allowedRoles={['RETAILER']}><RetailerProfile /></ProtectedRoute>} />
          <Route path="/retailer/orders" element={<ProtectedRoute allowedRoles={['RETAILER']}><Orders /></ProtectedRoute>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
