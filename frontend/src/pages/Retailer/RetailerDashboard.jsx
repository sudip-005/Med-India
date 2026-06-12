import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Store, 
  Package, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign
} from 'lucide-react';

export const RetailerDashboard = () => {
  const { profile, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await apiService.orders.list(token);
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load retailer sales orders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [token]);

  const hasInventory = !!profile?.stock_file_url;
  const isLicensed = !!(profile?.business_id && profile?.medical_license_id);

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => {
    // Calculate the subtotal for this retailer's items in the order
    const retailerSubtotal = order.items?.reduce((itemSum, item) => itemSum + (Number(item.price) * item.quantity), 0) || 0;
    return sum + retailerSubtotal;
  }, 0);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--secondary) 0%, #ea580c 100%)', 
        color: 'white', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-lg)', 
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <span style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          padding: '0.4rem 0.8rem', 
          borderRadius: 'var(--radius-full)', 
          fontSize: '0.85rem', 
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Retailer Dashboard
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '1rem', marginBottom: '0.5rem', color: 'white' }}>
          Welcome, {profile?.shop_name || 'Retailer Store'}!
        </h1>
        <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '1.05rem', lineHeight: '1.5' }}>
          Manage your digital catalog, track customer sales orders, and keep shop details updated.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem', gap: '1.25rem' }}>
        <div className="card" onClick={() => navigate('/retailer/orders')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{orders.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Sales Orders</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--secondary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--secondary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>₹{totalRevenue.toFixed(2)}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Estimated Revenue</div>
          </div>
        </div>

        <div className="card" onClick={() => navigate('/retailer/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>
              {hasInventory ? '✓ CSV Uploaded' : '✗ Missing Stock'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Inventory Status</div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start', marginBottom: '2.5rem' }}>
        
        {/* Left Column (2/3 width equivalent) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Customer Orders list */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Store Sales Orders</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Showing orders containing your products</span>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Package size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No customer orders received yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((order) => {
                  const orderSubtotal = order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
                  return (
                    <div key={order.order_id} style={{ 
                      padding: '1.25rem', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: '750', fontSize: '0.95rem' }}>Order #{order.order_id.slice(0, 8)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Clock size={12} /> {new Date(order.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className={`badge badge-${
                            order.status === 'delivered' ? 'success' : 
                            order.status === 'cancelled' ? 'error' : 'warning'
                          }`} style={{ textTransform: 'capitalize' }}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items from this seller */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            <span>{item.product_name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                            <strong>₹{(Number(item.price) * item.quantity).toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                          {order.address ? `${order.address.address_line_1}, ${order.address.city}` : 'Not Specified'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Your Subtotal:</span>
                        <strong style={{ color: 'var(--secondary)', fontSize: '1.05rem' }}>₹{orderSubtotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width equivalent) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Shop Credentials & Status */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Store size={18} style={{ color: 'var(--secondary)' }} /> Shop Profile
            </h3>
            
            {!isLicensed ? (
              <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1.25rem' }}>
                Business or Medical License ID not configured!
              </div>
            ) : (
              <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1.25rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                Shop credentials are authenticated.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Shop Name</span>
                <strong>{profile?.shop_name}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Merchant Owner</span>
                <strong>{profile?.owner_name}</strong>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>License IDs</span>
                <strong>Med: {profile?.medical_license_id || 'N/A'}</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Biz: {profile?.business_id || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Store Address</span>
                <span style={{ wordBreak: 'break-word' }}>{profile?.shop_address}</span>
              </div>
            </div>
            
            <Link to="/retailer/profile" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '1.25rem', textAlign: 'center' }}>
              Configure Storefront
            </Link>
          </div>

          {/* Stock inventory help details */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Stock CSV Instructions</h3>
            
            {!hasInventory ? (
              <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1rem' }}>
                Your shop is currently hidden from the patient marketplace because there is no stock uploaded.
              </div>
            ) : null}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.45', marginBottom: '1rem' }}>
              Create a spreadsheet with columns exactly: <strong>product_name</strong>, <strong>price</strong>, and <strong>stock</strong>. Export as .csv, and upload in your settings.
            </p>

            <div style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}>
              product_name,price,stock<br />
              Paracetamol 650,25.50,100<br />
              Vitamin C,120.00,50
            </div>

            <Link to="/retailer/profile" className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
              Upload Stock File
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
