// routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../features/dashboard';
import RefereeTribunalReport from '../features/referee-tribunal-report';
import ReimbursementForm from '../features/refund-form';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tribunal" element={<RefereeTribunalReport />} />
            <Route path="/reimbursement" element={<ReimbursementForm />} />
        </Routes>
    );
}

export default AppRoutes;