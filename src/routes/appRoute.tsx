// routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/dashboard';
import RefereeTribunalReport from '../features/referee-tribunal-report';
import ReimbursementForm from '../features/refund-form';
import BwaRefundForm from '../features/bwa-refund-form';
import UniformExeptionForm from '../features/uniform-exemption-form';
import AgeGroupExemptionForm from '../features/age-exemption-form';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tribunal" element={<RefereeTribunalReport />} />
            <Route path="/hrba-reimbursement" element={<ReimbursementForm />} />
            <Route path="/bwa-reimbursement" element={<BwaRefundForm />} />
            <Route path="/uniform-exemption" element={<UniformExeptionForm />} />
            <Route path="/age-exemption" element={<AgeGroupExemptionForm />} />
        </Routes>
    );
}

export default AppRoutes;