import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PatientDashboard } from './Patient/PatientDashboard';
import { DoctorDashboard } from './Doctor/DoctorDashboard';
import { RetailerDashboard } from './Retailer/RetailerDashboard';

export const Dashboard = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="page-loader">
        <span className="spinner" style={{ width: '3rem', height: '3rem' }}></span>
      </div>
    );
  }

  switch (user.role) {
    case 'PATIENT':
      return <PatientDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'RETAILER':
      return <RetailerDashboard />;
    default:
      return (
        <div className="card alert alert-error" style={{ margin: '2rem' }}>
          <h3>Invalid User Role</h3>
          <p>The system was unable to identify a valid user role for your account.</p>
        </div>
      );
  }
};
