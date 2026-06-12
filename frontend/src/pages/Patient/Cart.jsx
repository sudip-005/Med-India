import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Store, Plus, Sparkles } from 'lucide-react';

export const Cart = () => {
  const { token, updateCartBadge } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retailerLoading, setRetailerLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sample medicines for testing
  const sampleMedicines = [
    { name: 'Paracetamol 650mg', price: 15.50 },
    { name: 'Amoxicillin 500mg', price: 85.00 },
    { name: 'Ibuprofen 400mg', price: 22.00 },
    { name: 'Atorvastatin 10mg', price: 120.00 },
    { name: 'Metformin 500mg', price: 45.50 }
  ];

  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [selectedMed, setSelectedMed] = useState(sampleMedicines[0].name);
  const [qty, setQty] = useState(1);

  const loadCart = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiService.cart.getCart(token);
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRetailers = async () => {
    try {
      setRetailerLoading(true);
      const data = await apiService.retailers.getRetailers();
      setRetailers(data);
      if (data.length > 0) {
        setSelectedRetailer(data[0].retailer_id);
      }
    } catch (err) {
      console.error('Failed to load retailers:', err);
    } finally {
      setRetailerLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadRetailers();
  }, [token]);

  const handleRemoveItem = async (id) => {
    try {
      setErrorMsg('');
      await apiService.cart.removeItem(token, id);
      setSuccessMsg('Item removed from cart.');
      loadCart();
      updateCartBadge();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove item.');
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!selectedRetailer) {
      setErrorMsg('No active merchant stores found. Please register a Retailer profile first to buy products!');
      return;
    }

    const medInfo = sampleMedicines.find(m => m.name === selectedMed);
    if (!medInfo) return;

    try {
      setErrorMsg('');
      setSuccessMsg('');
      await apiService.cart.addItem(token, {
        product_name: medInfo.name,
        quantity: parseInt(qty),
        price: medInfo.price,
        retailer_id: selectedRetailer
      });
      setSuccessMsg(`Added ${medInfo.name} to cart.`);
      loadCart();
      updateCartBadge();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add item to cart.');
    }
  };

  const getRetailerName = (retailerId) => {
    const ret = retailers.find(r => r.retailer_id === retailerId);
    return ret ? ret.shop_name : 'Unknown Retailer';
  };

  const cartTotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Your Shopping Cart</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review and manage medicines currently added to your purchase queue.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
        
        {/* Cart items list (takes 2/3 of grid) */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart style={{ color: 'var(--primary)' }} /> Cart Items
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="spinner"></span>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Your shopping cart is empty. Try adding some items using the Quick Add tool on the right.
            </div>
          ) : (
            <div>
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Retailer Shop</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.cart_item_id}>
                        <td style={{ fontWeight: '600' }}>{item.product_name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Store size={14} /> {getRetailerName(item.retailer_id)}
                          </span>
                        </td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button 
                            onClick={() => handleRemoveItem(item.cart_item_id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Total:</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '750', color: 'var(--text-main)' }}>
                    ₹{cartTotal.toFixed(2)}
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/patient/checkout')} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Medicine Tool (takes 1/3 of grid) */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ color: 'var(--secondary)' }} /> Quick Add (Testing)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Add test items into your cart from the registered retailer shops.
          </p>

          <form onSubmit={handleQuickAdd}>
            <div className="form-group">
              <label className="form-label">Choose Retailer Store</label>
              {retailerLoading ? (
                <div>Loading stores...</div>
              ) : retailers.length === 0 ? (
                <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>
                  No active retailer stores registered on this database yet.
                </div>
              ) : (
                <select 
                  className="form-control form-select" 
                  value={selectedRetailer}
                  onChange={(e) => setSelectedRetailer(e.target.value)}
                  required
                >
                  {retailers.map(r => (
                    <option key={r.retailer_id} value={r.retailer_id}>{r.shop_name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Select Medicine</label>
              <select 
                className="form-control form-select" 
                value={selectedMed}
                onChange={(e) => setSelectedMed(e.target.value)}
              >
                {sampleMedicines.map(m => (
                  <option key={m.name} value={m.name}>{m.name} (₹{m.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="20"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-outline" 
              style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              disabled={retailers.length === 0}
            >
              Add to Cart <Plus size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
