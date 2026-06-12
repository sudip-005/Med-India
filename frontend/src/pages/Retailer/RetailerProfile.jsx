import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Store, FileText, Upload, Check, AlertTriangle } from 'lucide-react';

export const RetailerProfile = () => {
  const { token, profile, refreshUser } = useAuth();

  // Text inputs
  const [shopName, setShopName] = useState(profile?.shop_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [businessId, setBusinessId] = useState(profile?.business_id || '');
  const [medicalLicenseId, setMedicalLicenseId] = useState(profile?.medical_license_id || '');
  const [shopAddress, setShopAddress] = useState(profile?.shop_address || '');

  // File uploads
  const [bizFile, setBizFile] = useState(null);
  const [medFile, setMedFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);
  const [stockFile, setStockFile] = useState(null);
  const [shopImgFile, setShopImgFile] = useState(null);

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
        shop_name: shopName,
        owner_name: ownerName,
        business_id: businessId,
        medical_license_id: medicalLicenseId,
        shop_address: shopAddress
      };

      await apiService.retailers.updateProfile(token, payload);
      setSuccessMsg('Shop settings updated successfully.');
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update shop settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!bizFile && !medFile && !gstFile && !stockFile && !shopImgFile) {
      setErrorMsg('Please select at least one document or file to upload.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      if (bizFile) formData.append('business_license', bizFile);
      if (medFile) formData.append('medical_license', medFile);
      if (gstFile) formData.append('gst_certificate', gstFile);
      if (stockFile) formData.append('stock_file', stockFile);
      if (shopImgFile) formData.append('shop_image', shopImgFile);

      await apiService.retailers.createProfile(token, formData);
      setSuccessMsg('Merchant files uploaded successfully.');
      
      // Clear files
      setBizFile(null);
      setMedFile(null);
      setGstFile(null);
      setStockFile(null);
      setShopImgFile(null);
      
      await refreshUser();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload merchant files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Store Configuration</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your merchant shop information, upload inventory stock lists, and submit licenses.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Left Side: Text configurations */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store style={{ color: 'var(--primary)' }} /> Shop Details
          </h3>

          <form onSubmit={handleTextUpdate}>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Shop Name <span>*</span></label>
                <input
                  type="text"
                  className="form-control"
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
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Save Shop Details'}
            </button>
          </form>
        </div>

        {/* Right Side: Document & Stock uploads */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--secondary)' }} /> Inventory Stock & Licenses
          </h3>

          <form onSubmit={handleFileUpload} className="grid" style={{ gap: '1.25rem' }}>
            
            {/* Inventory CSV */}
            <div className="form-group" style={{ margin: 0, padding: '1rem', border: '1px solid var(--secondary)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-light)' }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0, color: 'var(--secondary)', fontWeight: '750' }}>Inventory CSV Stock File</label>
                {profile?.stock_file_url ? (
                  <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '600' }}><Check size={14} /> Active Catalog</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error)', fontSize: '0.85rem', fontWeight: '600' }}><AlertTriangle size={14} /> Stock Empty</span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.35rem 0 0.75rem 0' }}>
                Upload `.csv` with headers: `product_name`, `price`, `stock`.
              </p>
              <input
                type="file"
                className="form-control"
                accept=".csv"
                onChange={(e) => setStockFile(e.target.files[0])}
                style={{ backgroundColor: 'white' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>Business License (PDF/Image)</label>
                {profile?.business_license_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={(e) => setBizFile(e.target.files[0])}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>Medical License (PDF/Image)</label>
                {profile?.medical_license_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={(e) => setMedFile(e.target.files[0])}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between">
                <label className="form-label" style={{ margin: 0 }}>GST Certificate (PDF/Image)</label>
                {profile?.gst_certificate_url && <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', fontWeight: '500' }}><Check size={14} /> Registered</span>}
              </div>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={(e) => setGstFile(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : <><Upload size={18} /> Upload Merchant Files</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
