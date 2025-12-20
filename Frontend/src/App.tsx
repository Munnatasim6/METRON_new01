import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Loading from './components/common/Loading';
import PageViewTracker from './components/common/PageViewTracker';
import { Toaster } from 'sonner';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MonitorPage = lazy(() => import('./pages/MonitorPage'));
const MasterConfigPage = lazy(() => import('./pages/MasterConfigPage'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const App: React.FC = () => {
  return (
    <>
      <Toaster richColors position='top-right' />
      <PageViewTracker />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='dashboard' element={<Navigate to='/' replace />} />
            <Route path='monitor' element={<MonitorPage />} />
            <Route path='master_config' element={<MasterConfigPage />} />
            <Route path=':moduleId' element={<ModulePage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
