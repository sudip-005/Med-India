import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Stethoscope, FileText, Upload, Check } from 'lucide-react';

export const DoctorProfile = () => {
  const { token, profile, refreshUser } = useAuth();

  // Text inputs
  const [specialization, setSpecialization] = useState(profile?.specialization || '');
  const [registrationNumber, setRegistrationNumber] = useState(profile?.registration_number || '');
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years || '');
  const [consultationFee, setConsultationFee] = useState(profile?.consultation_fee || '');
  const [clinicAddress, setClinicAddress] = useState(profile?.clinic_address || '');

  // File uploads
  const [regFile, setRegFile] = useState(null);
  const [degFile, setDegFile] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleTextUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const payload = {
        specialization,
        registration_number: registrationNumber,
        experience_years: parseInt(experienceYears) || null,
        consultation_fee: parseFloat(consultationFee) || null,
        clinic_address: clinicAddress || null
      };

      await apiService.doctors.updateProfile(token, payload);
      setSuccessMsg('Clinic configuration updated.');
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update clinic configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!regFile && !degFile && !imgFile) {
      setErrorMsg('Please select at least one document to upload.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      if (regFile) formData.append('registration_certificate', regFile);
      if (degFile) formData.append('degree_certificate', degFile);
      if (imgFile) formData.append('profile_image', imgFile);

      await apiService.doctors.createProfile(token, formData);
      setSuccessMsg('Verification documents uploaded successfully.');
      
      // Clear files
      setRegFile(null);
      setDegFile(null);
      setImgFile(null);
      
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload verification documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Clinic Configuration</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your specialization details, consultation fees, and verify medical credentials.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Left Side: Text configurations */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope style={{ color: 'var(--primary)' }} /> Clinic Details
          </h3>

          <form onSubmit={handleTextUpdate}>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Specialization <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
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
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 8"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Consultation Fee (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="₹ 500"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Clinic Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Full physical clinic consultation address"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Save Clinic Configuration'}
            </button>
          </form>
        </div>

        {/* Right Side: Document uploads */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--secondary)' }} /> Verification Certificates
          </h3>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Upload legal medical files to active your doctor registration on the Med India portal search list.
          </p>

          <form onSubmit={handleFileUpload} className="grid" style={{ gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>Medical Registration Certificate</label>
                {profile?.registration_certificate_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={(e) => setRegFile(e.target.files[0])}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>Degree Verification Document</label>
                {profile?.degree_certificate_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={(e) => setDegFile(e.target.files[0])}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>Profile Image Avatar</label>
                {profile?.profile_image_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setImgFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : <><Upload size={18} /> Upload Certificates</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
