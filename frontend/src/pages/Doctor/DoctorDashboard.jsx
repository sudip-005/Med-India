import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  FileText, 
  MapPin, 
  Clock, 
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { profile } = useAuth();
  const isProfileConfigured = !!(profile?.specialization && profile?.consultation_fee);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #0284c7 0%, var(--primary) 100%)', 
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
          Doctor Portal
        </span>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '1rem', marginBottom: '0.5rem', color: 'white' }}>
          Welcome, Dr. {profile?.first_name || 'Doctor'} {profile?.last_name || ''}!
        </h1>
        <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '1.05rem', lineHeight: '1.5' }}>
          Manage your clinical availability, upload registration certificates, and configure patient consultation fees.
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Left Side: Profile Setup Configuration */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Stethoscope style={{ color: 'var(--primary)' }} /> Clinical Profile Settings
          </h3>

          {!isProfileConfigured ? (
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertTriangle style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Profile Incomplete</strong>
                Please set up your medical specialization and clinic consultation fee to list your profile on the patient search engine.
              </div>
            </div>
          ) : (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
              <CheckCircle style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Profile Live & Active</strong>
                Patients can now view and search your profile in the Med India directory.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Specialization</span>
              <strong>{profile?.specialization || <span style={{ color: 'var(--secondary)' }}>Not Set</span>}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Consultation Fee</span>
              <strong>{profile?.consultation_fee ? `₹${profile.consultation_fee}` : <span style={{ color: 'var(--secondary)' }}>Not Set</span>}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Years of Experience</span>
              <strong>{profile?.experience_years ? `${profile.experience_years} Years` : <span style={{ color: 'var(--text-muted)' }}>0 Years</span>}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Medical Registration No.</span>
              <strong>{profile?.registration_number}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Clinic Address</span>
              <strong>{profile?.clinic_address || 'Not Set'}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Availability Days</span>
              <strong>
                {profile?.available_days && profile.available_days.length > 0 
                  ? profile.available_days.join(', ') 
                  : 'Not Set'}
              </strong>
            </div>
          </div>

          <Link to="/doctor/profile" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
            Configure Profile Details
          </Link>
        </div>

        {/* Right Side: Verification Documents Status */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Award style={{ color: 'var(--secondary)' }} /> Certificate Registrations
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            To build user trust and list as a verified practitioner, upload copies of your official registration and degree certificates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1rem', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Medical Registration Certificate</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mandatory license document</div>
                </div>
              </div>
              <div>
                {profile?.registration_certificate_url ? (
                  <span className="badge badge-success">✓ Uploaded</span>
                ) : (
                  <span className="badge badge-error">✗ Missing</span>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '1rem', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Degree / Specialization Certificate</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MD, MBBS, or equivalent credentials</div>
                </div>
              </div>
              <div>
                {profile?.degree_certificate_url ? (
                  <span className="badge badge-success">✓ Uploaded</span>
                ) : (
                  <span className="badge badge-error">✗ Missing</span>
                )}
              </div>
            </div>
          </div>

          <Link to="/doctor/profile" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
            Upload Official Documents
          </Link>
        </div>

      </div>
    </div>
  );
};
