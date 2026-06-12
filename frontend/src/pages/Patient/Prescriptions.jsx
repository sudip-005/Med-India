import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { FileText, Plus, Trash2, ArrowUpCircle, ExternalLink } from 'lucide-react';

export const Prescriptions = () => {
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [file, setFile] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadPrescriptions = async () => {
    if (!token) return;
    try {
      setFetching(true);
      const data = await apiService.prescriptions.list(token);
      setPrescriptions(data);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('diagnosis', diagnosis);
      formData.append('notes', notes);

      await apiService.prescriptions.upload(token, formData);
      setSuccessMsg('Prescription uploaded successfully.');
      
      // Clear fields
      setFile(null);
      setDiagnosis('');
      setNotes('');
      // Reset input element
      e.target.reset();
      
      loadPrescriptions();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await apiService.prescriptions.delete(token, id);
      setSuccessMsg('Prescription deleted.');
      loadPrescriptions();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete prescription.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>Prescription Manager</h1>
        <p style={{ color: 'var(--text-muted)' }}>Upload and view your doctor prescriptions (PDF or Image) to order restricted medicines.</p>
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Upload Prescription */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpCircle style={{ color: 'var(--primary)' }} /> Upload New Prescription
          </h3>
          
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Select File (PDF or Image) <span>*</span></label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis / Reason</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Fever & Cough, Routine Checkup"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Doctor Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Take Paracetamol twice a day after meals"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Upload Prescription'}
            </button>
          </form>
        </div>

        {/* Prescription History */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--secondary)' }} /> Prescription History
          </h3>

          {fetching ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="spinner"></span>
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No prescription uploads found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map((presc) => (
                <div key={presc.prescription_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      {presc.diagnosis || 'Unspecified Diagnosis'}
                    </div>
                    {presc.notes && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Notes: {presc.notes}
                      </div>
                    )}
                    <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      Uploaded: {new Date(presc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a
                      href={presc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light btn-sm"
                      style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                      title="View file"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(presc.prescription_id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.4rem' }}
                      title="Delete prescription"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
