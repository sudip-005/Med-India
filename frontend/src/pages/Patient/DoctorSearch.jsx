import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Search, Stethoscope, MapPin, DollarSign, Award, Phone } from 'lucide-react';

export const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Selected doctor for contact details modal
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const filters = {};
      if (specialization) filters.specialization = specialization;
      if (city) filters.city = city;
      
      const data = await apiService.doctors.getDoctors(filters);
      setDoctors(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to search doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Find Medical Specialists</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse verified doctors and configure consultation schedules.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {/* Filter Form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleFilterSubmit} className="grid grid-3" style={{ alignItems: 'end', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Specialization</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cardiology, Dentistry"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Kolkata, New Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', minWidth: '150px' }}>
            <Search size={18} /> Search Doctors
          </button>
        </form>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
        </div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          No registered specialists match your filters.
        </div>
      ) : (
        <div className="grid grid-3">
          {doctors.map((doc) => (
            <div key={doc.doctor_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)' }}>
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                      Dr. {doc.first_name} {doc.last_name}
                    </h3>
                    <span className="badge badge-primary">{doc.specialization}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={16} style={{ color: 'var(--primary)' }} />
                    <span><strong>Experience:</strong> {doc.experience_years ? `${doc.experience_years} Years` : 'Not Specified'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} style={{ color: 'var(--secondary)' }} />
                    <span><strong>Fee:</strong> {doc.consultation_fee ? `₹${doc.consultation_fee}` : 'Not Specified'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} style={{ color: 'var(--text-light)' }} />
                    <span><strong>Clinic:</strong> {doc.clinic_address || 'Not Configured'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDoctor(doc)} 
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Doctor Consultation</h3>
              <button className="modal-close" onClick={() => setSelectedDoctor(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                  <Stethoscope size={30} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                  </h3>
                  <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem' }}>{selectedDoctor.specialization}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div>
                  <strong>Clinic Address:</strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{selectedDoctor.clinic_address || 'Not Configured'}</div>
                </div>
                <div>
                  <strong>Consultation Fee:</strong>
                  <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.15rem' }}>
                    ₹{selectedDoctor.consultation_fee || '0.00'}
                  </div>
                </div>
                {selectedDoctor.phone && (
                  <div>
                    <strong>Clinic Phone / Contact:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-main)', fontWeight: '500', marginTop: '0.15rem' }}>
                      <Phone size={14} style={{ color: 'var(--primary)' }} /> {selectedDoctor.phone}
                    </div>
                  </div>
                )}
              </div>

              <div className="alert alert-info" style={{ margin: 0, fontSize: '0.85rem' }}>
                Please call the clinic phone number above to confirm the doctor's active consultation timings and schedule your offline appointment slot.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
