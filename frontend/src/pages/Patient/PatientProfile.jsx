import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { User, MapPin, Plus, Trash2, Heart, ShieldAlert } from 'lucide-react';

export const PatientProfile = () => {
  const { token, profile, refreshUser } = useAuth();
  
  // Profile Form State
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState(profile?.blood_group || '');
  const [allergies, setAllergies] = useState(Array.isArray(profile?.allergies) ? profile.allergies.join(', ') : '');
  const [insuranceProvider, setInsuranceProvider] = useState(profile?.insurance_provider || '');

  // Address Form State
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch addresses
  const loadAddresses = async () => {
    if (!token) return;
    try {
      setAddressLoading(true);
      const data = await apiService.patients.getAddresses(token);
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [token]);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const updatedData = {
        first_name: firstName,
        last_name: lastName,
        gender,
        blood_group: bloodGroup,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        insurance_provider: insuranceProvider
      };
      
      await apiService.patients.updateProfile(token, updatedData);
      setSuccessMsg('Profile updated successfully.');
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !pincode) {
      setErrorMsg('Please enter all required address fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      
      const payload = {
        address_line_1: addressLine1,
        address_line_2: addressLine2 || null,
        city,
        state,
        pincode,
        address_type: addressType,
        is_default: isDefault
      };
      
      await apiService.patients.addAddress(token, payload);
      
      // Clear address form
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setAddressType('Home');
      setIsDefault(false);
      setShowAddressModal(false);
      
      setSuccessMsg('New delivery address added.');
      loadAddresses();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add address.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await apiService.patients.deleteAddress(token, id);
      setSuccessMsg('Address deleted.');
      loadAddresses();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete address.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Patient Profile & Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal medical information and delivery addresses.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User style={{ color: 'var(--primary)' }} /> Profile Information
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">First Name <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gender</label>
                <select className="form-control form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Blood Group</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. O+, B-"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Medical Allergies (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Peanuts, Penicillin, Aspirin"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Insurance Provider</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. LIC Healthcare, Star Health"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Address Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MapPin style={{ color: 'var(--secondary)' }} /> Saved Delivery Addresses
            </h3>
            <button onClick={() => setShowAddressModal(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Plus size={16} /> Add New
            </button>
          </div>

          {addressLoading ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <span className="spinner"></span>
            </div>
          ) : addresses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No saved addresses found. Add one to checkout orders.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {addresses.map((addr) => (
                <div key={addr.address_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className="badge badge-primary">{addr.address_type}</span>
                      {addr.is_default && <span className="badge badge-success">Default</span>}
                    </div>
                    <div style={{ fontWeight: '500' }}>{addr.address_line_1}</div>
                    {addr.address_line_2 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{addr.address_line_2}</div>}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.address_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.5rem', alignSelf: 'center' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Delivery Address</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddAddress}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Address Line 1 <span>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Flat, House no., Building, Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Area, Colony, Landmark"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>

                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">City <span>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kolkata"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">State <span>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. West Bengal"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Pincode <span>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="700091"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Address Type</label>
                    <select className="form-control form-select" value={addressType} onChange={(e) => setAddressType(e.target.value)}>
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="isDefault" style={{ fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer' }}>
                    Set as default delivery address
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
