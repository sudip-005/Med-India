import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  FileText, 
  ShoppingCart, 
  Package, 
  Stethoscope, 
  ArrowRight,
  Heart,
  Pill,
  Clock,
  Plus
} from 'lucide-react';

export const PatientDashboard = () => {
  const { profile, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    addressesCount: 0,
    prescriptionsCount: 0,
    ordersCount: 0,
    cartItemsCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [addresses, prescriptions, orders, cart] = await Promise.all([
          apiService.patients.getAddresses(token).catch(() => []),
          apiService.prescriptions.list(token).catch(() => []),
          apiService.orders.list(token).catch(() => []),
          apiService.cart.getCart(token).catch(() => ({ items: [] }))
        ]);

        setStats({
          addressesCount: addresses.length,
          prescriptionsCount: prescriptions.length,
          ordersCount: orders.length,
          cartItemsCount: cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
        });

        // Get top 3 recent orders
        if (Array.isArray(orders)) {
          setRecentOrders(orders.slice(0, 3));
        }

        // Get top 3 recent prescriptions
        if (Array.isArray(prescriptions)) {
          setRecentPrescriptions(prescriptions.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load patient dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', 
        color: 'white', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-lg)', 
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-10%', bottom: '-30%', opacity: 0.1, color: 'white' }}>
          <Heart size={250} fill="white" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            padding: '0.4rem 0.8rem', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.85rem', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Patient Portal
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '1rem', marginBottom: '0.5rem', color: 'white' }}>
            Welcome Back, {profile?.first_name || 'Patient'}!
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '1.05rem', lineHeight: '1.5' }}>
            Manage your health consults, prescriptions, and order medicines from your local trusted pharmacies.
          </p>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-4" style={{ marginBottom: '2.5rem', gap: '1.25rem' }}>
        <div className="card" onClick={() => navigate('/patient/cart')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <div style={{ backgroundColor: 'var(--secondary-light)', padding: '1rem', borderRadius: '14px', color: 'var(--secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.cartItemsCount}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Items in Cart</div>
          </div>
        </div>

        <div className="card" onClick={() => navigate('/patient/prescriptions')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '14px', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.prescriptionsCount}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Prescriptions</div>
          </div>
        </div>

        <div className="card" onClick={() => navigate('/patient/orders')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '14px', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.ordersCount}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Orders Placed</div>
          </div>
        </div>

        <div className="card" onClick={() => navigate('/patient/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '14px', color: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{stats.addressesCount}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Saved Addresses</div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start', marginBottom: '2.5rem' }}>
        
        {/* Left Column (2/3 width equivalent) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Actions Panel */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Quick Healthcare Services
            </h3>
            <div className="grid grid-2" style={{ gap: '1.25rem' }}>
              <div className="card" style={{ 
                border: '1px solid var(--border-color)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',
                boxShadow: 'none',
                margin: 0
              }}>
                <div>
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    <Stethoscope size={20} />
                  </div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Consult Specialist</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1rem' }}>
                    Search and book consultations with verified medical specialists in your area.
                  </p>
                </div>
                <Link to="/patient/doctors" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Find Doctors <ArrowRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ 
                border: '1px solid var(--border-color)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                boxShadow: 'none',
                margin: 0
              }}>
                <div>
                  <div style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', width: 'fit-content', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                    <Pill size={20} />
                  </div>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Order Medicines</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1rem' }}>
                    Add essential medicines from pharmacy shop inventories and proceed to checkout.
                  </p>
                </div>
                <Link to="/patient/doctors" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Browse Retailers <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Recent Orders</h3>
              <Link to="/patient/orders" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Package size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentOrders.map((order) => (
                  <div key={order.order_id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Order #{order.order_id.slice(0, 8)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge badge-${
                        order.status === 'delivered' ? 'success' : 
                        order.status === 'cancelled' ? 'error' : 'warning'
                      }`}>
                        {order.status}
                      </span>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{order.total_amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width equivalent) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Medical Profile Summary Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <User size={18} style={{ color: 'var(--primary)' }} /> Health Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Blood Group</span>
                <strong style={{ color: 'var(--secondary)' }}>{profile?.blood_group || 'Not Specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gender</span>
                <strong>{profile?.gender || 'Not Specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>DOB</span>
                <strong>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not Specified'}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allergies</span>
                <span style={{ fontSize: '0.85rem', wordBreak: 'break-word', fontWeight: '600' }}>
                  {profile?.allergies && profile.allergies.length > 0 
                    ? profile.allergies.join(', ') 
                    : 'None reported'}
                </span>
              </div>
            </div>
            <Link to="/patient/profile" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '1.25rem', textAlign: 'center' }}>
              Edit Health Records
            </Link>
          </div>

          {/* Recent Prescriptions */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} /> Prescriptions
              </h3>
              <Link to="/patient/prescriptions" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                <Plus size={16} />
              </Link>
            </div>

            {recentPrescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>No prescriptions uploaded.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentPrescriptions.map((p) => (
                  <a key={p.prescription_id} href={p.file_url} target="_blank" rel="noopener noreferrer" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}>
                    <FileText size={16} style={{ color: 'var(--secondary)' }} />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      <strong>{p.diagnosis || 'Prescription'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
