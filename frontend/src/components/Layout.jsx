import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  ShoppingCart, 
  LogOut, 
  User, 
  MapPin, 
  FileText, 
  Search, 
  Package, 
  Stethoscope, 
  Store, 
  FileCode,
  LayoutDashboard,
  Menu
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, cartCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderSidebar = () => {
    if (!user) return null;

    if (user.role === 'PATIENT') {
      return (
        <aside className="sidebar">
          <div className="sidebar-heading">Patient Hub</div>
          <div className="sidebar-menu">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/patient/doctors" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Search size={18} /> Find Doctors
            </NavLink>
            <NavLink to="/patient/cart" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> Cart
            </NavLink>
            <NavLink to="/patient/prescriptions" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> Prescriptions
            </NavLink>
            <NavLink to="/patient/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <User size={18} /> Profile & Addresses
            </NavLink>
            <NavLink to="/patient/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Order History
            </NavLink>
          </div>
        </aside>
      );
    }

    if (user.role === 'DOCTOR') {
      return (
        <aside className="sidebar">
          <div className="sidebar-heading">Doctor Panel</div>
          <div className="sidebar-menu">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/doctor/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Stethoscope size={18} /> Clinic Configuration
            </NavLink>
          </div>
        </aside>
      );
    }

    if (user.role === 'RETAILER') {
      return (
        <aside className="sidebar">
          <div className="sidebar-heading">Retailer Panel</div>
          <div className="sidebar-menu">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/retailer/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Store size={18} /> Store Configuration
            </NavLink>
            <NavLink to="/retailer/orders" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Customer Orders
            </NavLink>
          </div>
        </aside>
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <Activity size={28} style={{ color: 'var(--primary)' }} />
          Med <span>India</span>
        </div>

        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'PATIENT' && (
                <Link to="/patient/cart" className="nav-link" style={{ position: 'relative' }}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-secondary)'
                    }}>
                      {cartCount}
                    </span>
                  )}
                  Cart
                </Link>
              )}
              
              <span className="nav-link" style={{ cursor: 'default', color: 'var(--text-main)', fontWeight: '600' }}>
                <User size={18} /> {user.email} ({user.role})
              </span>
              
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className={user ? 'dashboard-layout' : ''}>
        {renderSidebar()}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
