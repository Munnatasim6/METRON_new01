import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { useAppStore } from '../store/useAppStore';
import { APP_MODULES } from '../constants';
import { SystemStatus } from '../types';
import SEO from '../components/common/SEO';


const DashboardPage: React.FC = () => {
  return (
    <React.Fragment>
      <SEO title="Dashboard" description="Metron Trading Dashboard overview" />
      <Dashboard />
    </React.Fragment>
  );
};


export default DashboardPage;
