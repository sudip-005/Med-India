import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Package, Clock, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const Orders = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Track open order detail drawers/accordeons
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);

  const loadOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await apiService.orders.list(token);
      setOrders(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const toggleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setExpandedDetails(null);
      return;
    }

    try {
      setExpandedOrderId(orderId);
      const details = await apiService.orders.getById(token, orderId);
      setExpandedDetails(details);
    } catch (err) {
      console.error('Failed to load order details:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'confirmed':
        return <span className="badge badge-primary">Confirmed</span>;
      case 'packed':
      case 'shipped':
        return <span className="badge badge-secondary">In Transit ({status})</span>;
      case 'delivered':
        return <span className="badge badge-success">Delivered</span>;
      default:
        return <span className="badge badge-error">{status}</span>;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
          {user?.role === 'RETAILER' ? 'Customer Sales Orders' : 'Your Order History'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {user?.role === 'RETAILER' ? 'Track order items purchased from your retail shop inventory.' : 'View details and delivery status of your medical orders.'}
        </p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Package size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <div>No orders found.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => (
            <div key={order.order_id} className="card" style={{ padding: '1.5rem', transition: 'var(--transition)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Order ID</div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>`{order.order_id}`</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Date</div>
                  <div style={{ fontSize: '0.9rem' }}>{new Date(order.created_at).toLocaleString()}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Status</div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: '700' }}>Total Amount</div>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{parseFloat(order.total_amount).toFixed(2)}</div>
                </div>

                <button 
                  onClick={() => toggleExpandOrder(order.order_id)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {expandedOrderId === order.order_id ? (
                    <>Hide Details <ChevronUp size={16} /></>
                  ) : (
                    <>View Details <ChevronDown size={16} /></>
                  )}
                </button>
              </div>

              {/* Expanded details container */}
              {expandedOrderId === order.order_id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', animation: 'modalSlide 0.2s ease-out' }}>
                  
                  {expandedDetails ? (
                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                      
                      {/* Left side: Items */}
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</h4>
                        <div className="table-container" style={{ margin: 0 }}>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Medicine Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expandedDetails.items?.map((item) => (
                                <tr key={item.order_item_id}>
                                  <td style={{ fontWeight: '600' }}>{item.product_name}</td>
                                  <td>{item.quantity}</td>
                                  <td>₹{parseFloat(item.price).toFixed(2)}</td>
                                  <td style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right side: Address & Metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Details</h4>
                          {expandedDetails.address ? (
                            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{expandedDetails.address.address_type} Address</div>
                              <div>{expandedDetails.address.address_line_1}</div>
                              {expandedDetails.address.address_line_2 && <div>{expandedDetails.address.address_line_2}</div>}
                              <div>{expandedDetails.address.city}, {expandedDetails.address.state} - <strong>{expandedDetails.address.pincode}</strong></div>
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No address info saved.</div>
                          )}
                        </div>

                        {expandedDetails.prescription && (
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Prescription</h4>
                            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                              <div>
                                <div><strong>Reason:</strong> {expandedDetails.prescription.diagnosis || 'Unspecified'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>Uploaded: {new Date(expandedDetails.prescription.created_at).toLocaleDateString()}</div>
                              </div>
                              <a href={expandedDetails.prescription.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                View File
                              </a>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <span className="spinner"></span>
                    </div>
                  )}

                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
