import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AnalystDashboard from './pages/AnalystDashboard';
import UploadPage from './pages/UploadPage';

import ProcessingJobsPage from './pages/ProcessingJobsPage';
import AuditLogsPage from './pages/AuditLogsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<AnalystDashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="jobs" element={<ProcessingJobsPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
