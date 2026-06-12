import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText, CheckCircle, CreditCard, ShoppingBag, Plus } from 'lucide-react';

export const Checkout = () => {
  const { token, updateCartBadge } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCheckoutData = async () => {
    if (!token) return;
    try {
      setFetching(true);
      setErrorMsg('');
      
      const [cartData, addressesData, prescriptionsData] = await Promise.all([
        apiService.cart.getCart(token).catch(() => ({ items: [] })),
        apiService.patients.getAddresses(token).catch(() => []),
        apiService.prescriptions.list(token).catch(() => [])
      ]);
      
      setCart(cartData);
      setAddresses(addressesData);
      setPrescriptions(prescriptionsData);

      // Pre-select default address if available
      const defAddr = addressesData.find(a => a.is_default) || addressesData[0];
      if (defAddr) {
        setSelectedAddress(defAddr.address_id);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load checkout details.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, [token]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      setErrorMsg('Please select a delivery address first.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const res = await apiService.orders.checkout(
        token, 
        selectedAddress, 
        selectedPrescription || null
      );
      
      setSuccessMsg('Your order has been placed successfully!');
      updateCartBadge();
      
      setTimeout(() => {
        navigate('/patient/orders');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (fetching) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add some products into your cart to proceed with checkout.</p>
        <button onClick={() => navigate('/patient/cart')} className="btn btn-primary">Go to Cart</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Checkout Order</h1>
        <p style={{ color: 'var(--text-muted)' }}>Confirm your shipping details and submit your prescription if required.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
        
        {/* Shipping & Prescription Details (takes 2/3) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Select Address */}
          <div className="card" style={{ padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <MapPin style={{ color: 'var(--primary)' }} /> Shipping Address <span>*</span>
              </h3>
              <button onClick={() => navigate('/patient/profile')} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={14} /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div style={{ color: 'var(--error)', padding: '1rem', border: '1px dashed var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                No delivery addresses configured. You must set up a delivery address in your Profile settings before buying.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map(addr => (
                  <label 
                    key={addr.address_id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      border: `2px solid ${selectedAddress === addr.address_id ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: selectedAddress === addr.address_id ? 'var(--primary-light)' : 'transparent',
                      transition: 'var(--transition)'
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.address_id}
                      checked={selectedAddress === addr.address_id}
                      onChange={() => setSelectedAddress(addr.address_id)}
                      style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{addr.address_type}</span>
                        {addr.is_default && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Default</span>}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {addr.address_line_1}
                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Link Prescription */}
          <div className="card" style={{ padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <FileText style={{ color: 'var(--secondary)' }} /> Link Prescription (Optional)
              </h3>
              <button onClick={() => navigate('/patient/prescriptions')} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={14} /> Upload PDF
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              If your cart contains schedule-restricted medicines, select a previously uploaded doctor prescription to link to this order.
            </p>

            {prescriptions.length === 0 ? (
              <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No prescription files uploaded. (Required only for restricted medicines).
              </div>
            ) : (
              <select
                className="form-control form-select"
                value={selectedPrescription}
                onChange={(e) => setSelectedPrescription(e.target.value)}
              >
                <option value="">-- Do not link any prescription --</option>
                {prescriptions.map(presc => (
                  <option key={presc.prescription_id} value={presc.prescription_id}>
                    {presc.diagnosis || 'Diagnosis Info'} ({new Date(presc.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* Order Summary sidebar (takes 1/3) */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag style={{ color: 'var(--text-main)' }} /> Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            {cart.items.map(item => (
              <div key={item.cart_item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontWeight: '600' }}>{item.product_name}</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span>
                </div>
                <div style={{ fontWeight: '500' }}>₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Total Amount:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '750', color: 'var(--primary)' }}>
              ₹{cartTotal.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <CreditCard size={16} />
              <span><strong>Payment Method:</strong> Cash on Delivery (CoD)</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
            disabled={loading || !selectedAddress}
          >
            {loading ? <span className="spinner"></span> : <>Place Secure Order <CheckCircle size={18} /></>}
          </button>
        </div>

      </div>
    </div>
  );
};
