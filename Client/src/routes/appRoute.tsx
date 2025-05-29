// routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/dashboard';
import RefereeTribunalReport from '../features/referee-tribunal-report';
import ReimbursementForm from '../features/refund-form';
import BwaRefundForm from '../features/bwa-refund-form';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tribunal" element={<RefereeTribunalReport />} />
            <Route path="/hrba-reimbursement" element={<ReimbursementForm />} />
            <Route path="/bwa-reimbursement" element={<BwaRefundForm />} />
        </Routes>
    );
}

export default AppRoutes;