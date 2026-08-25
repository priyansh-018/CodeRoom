import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HostDashboardPage } from './HostDashboardPage';
import { CandidateDashboardPage } from './CandidateDashboardPage';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'HOST') {
    return <HostDashboardPage />;
  }

  return <CandidateDashboardPage />;
};
