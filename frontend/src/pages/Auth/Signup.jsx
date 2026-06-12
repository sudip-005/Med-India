import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Stethoscope, Store, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('PATIENT'); // 'PATIENT' | 'DOCTOR' | 'RETAILER'
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Patient / Doctor profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  
  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Retailer fields
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [medicalLicenseId, setMedicalLicenseId] = useState('');
  const [shopAddress, setShopAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !phone) {
      setErrorMsg('Please fill in all general required fields.');
      return;
    }

    let payload = {
      email,
      password,
      phone
    };

    if (role === 'PATIENT') {
      if (!firstName) {
        setErrorMsg('Please enter your first name.');
        return;
      }
      payload = {
        ...payload,
        first_name: firstName,
        last_name: lastName || '',
        gender,
        date_of_birth: dateOfBirth || null,
        blood_group: bloodGroup || null
      };
    } else if (role === 'DOCTOR') {
      if (!firstName || !specialization || !registrationNumber) {
        setErrorMsg('Please enter your first name, specialization, and registration ID.');
        return;
      }
      payload = {
        ...payload,
        first_name: firstName,
        last_name: lastName || '',
        gender,
        date_of_birth: dateOfBirth || null,
        specialization,
        registration_number: registrationNumber
      };
    } else if (role === 'RETAILER') {
      if (!shopName || !ownerName || !businessId || !medicalLicenseId || !shopAddress) {
        setErrorMsg('Please enter your shop name, owner name, business ID, medical license ID, and address.');
        return;
      }
      payload = {
        ...payload,
        shop_name: shopName,
        owner_name: ownerName,
        business_id: businessId,
        medical_license_id: medicalLicenseId,
        shop_address: shopAddress
      };
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await signup(role, payload);
      setSuccessMsg(res.message || 'Account registered successfully! You can now log in.');
      
      // Clear forms
      setEmail('');
      setPassword('');
      setPhone('');
      setFirstName('');
      setLastName('');
      setShopName('');
      setOwnerName('');
      setBusinessId('');
      setMedicalLicenseId('');
      setShopAddress('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please check your data and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Join Med India healthcare marketplace</p>
        </div>

        {/* Role Select Tabs */}
        <div className="tabs-header" style={{ justifyContent: 'center' }}>
          <button 
            type="button" 
            className={`tab-btn ${role === 'PATIENT' ? 'active' : ''}`}
            onClick={() => handleRoleChange('PATIENT')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <User size={18} /> Patient
          </button>
          <button 
            type="button" 
            className={`tab-btn ${role === 'DOCTOR' ? 'active' : ''}`}
            onClick={() => handleRoleChange('DOCTOR')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Stethoscope size={18} /> Doctor
          </button>
          <button 
            type="button" 
            className={`tab-btn ${role === 'RETAILER' ? 'active' : ''}`}
            onClick={() => handleRoleChange('RETAILER')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Store size={18} /> Retailer
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* General Credentials Grid */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Account Credentials</h4>
          <div className="grid grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password (Min 6 chars) <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Phone Number <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }} />

          {/* Role specific profile fields */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Profile Information</h4>
          
          {(role === 'PATIENT' || role === 'DOCTOR') && (
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">First Name <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="John"
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
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Gender <span>*</span></label>
                <select className="form-control form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              {role === 'PATIENT' && (
                <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                  <label className="form-label">Blood Group (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. O+, A-"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  />
                </div>
              )}
              {role === 'DOCTOR' && (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Specialization <span>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cardiology, Pediatrics"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Medical Registration ID <span>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. MC12345"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {role === 'RETAILER' && (
            <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Shop Name <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Apna Medical Store"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Owner Name <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rajesh Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Business Registration ID <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BIZ987654"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Medical License ID <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. LIC112233"
                  value={medicalLicenseId}
                  onChange={(e) => setMedicalLicenseId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Shop Address <span>*</span></label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Full physical address of shop"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : <>Register Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
