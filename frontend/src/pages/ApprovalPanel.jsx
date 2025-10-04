//frontend/src/pages/ApprovalPanel.jsx (Replace the file content)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ApprovalPanel() {
    const navigate = useNavigate();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingUsers = useCallback(async () => {
        try {
            const res = await axios.get('/api/admin/pending-users');
            setPendingUsers(res.data.users);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch pending users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    // Admin approves the user, setting role to 'employee'
    const handleApprove = async (userId) => {
        setError('');
        if (!window.confirm("Approve this user as an Employee?")) {
            return;
        }
        try {
            await axios.post(`/api/admin/user/approve/${userId}`, { newRole: 'employee' });
            alert("User approved and granted Employee access!");
            fetchPendingUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Approval failed.');
        }
    };
    
    // --- NEW: Handle Rejection (Deletion) ---
    const handleReject = async (userId, username) => {
        setError('');
        if (!window.confirm(`Are you sure you want to permanently REJECT and DELETE the user: ${username}?`)) {
            return;
        }
        try {
            // Use the existing DELETE endpoint for permanent rejection
            await axios.delete(`/api/admin/user/${userId}`);
            alert(`User ${username} permanently rejected and removed.`);
            fetchPendingUsers(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.error || 'Rejection failed.');
        }
    };
    // ----------------------------------------

    if (loading) return <div className="p-8 text-center">Loading Approval Panel...</div>;

    return (
        <div className="container mx-auto p-6 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-primary-blue">
                    Employee Authorization Queue
                </h2>
                <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-smooth">
                {pendingUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users are currently awaiting approval.</p>
                ) : (
                    <div className="space-y-4">
                        {pendingUsers.map(u => (
                            <div key={u._id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-secondary-gray transition">
                                <div>
                                    <p className="font-semibold text-lg">{u.name} (<span className="text-sm text-gray-600">{u.username}</span>)</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                                <div className="space-x-3">
                                    <button 
                                        onClick={() => handleApprove(u._id)} 
                                        className="bg-accent-teal text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-teal/90 transition shadow-md"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleReject(u._id, u.username)} 
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition shadow-md"
                                    >
                                        Reject & Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <p className="mt-4 text-sm text-gray-500">Note: All pending registrations are processed as "Employee" role upon approval.</p>
        </div>
    );
}

export default ApprovalPanel;

