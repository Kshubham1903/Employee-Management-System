// frontend/src/pages/EmployeeView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate added

const EmployeeView = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // Initialize useNavigate
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await axios.get('/api/admin/employees/all');
            setEmployees(res.data.employees);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch employee list.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // --- Admin Action Handlers ---
    const handleDelete = async (userId, name) => {
        if (userId === user.userId) {
            alert("Error: You cannot delete your own Admin account!");
            return;
        }
        if (!window.confirm(`Are you sure you want to permanently delete user ${name} and all their assigned tasks?`)) {
            return;
        }
        try {
            await axios.delete(`/api/admin/user/${userId}`);
            alert(`${name} deleted successfully!`);
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.error || 'Deletion failed.');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Employee List...</div>;

    return (
        <div className="min-h-screen bg-secondary-gray p-6 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-primary-blue">
                    Optimistic Employee Roster
                </h2>
                {/* BACK BUTTON INTEGRATION */}
                <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>
            
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            <div className="bg-white p-8 rounded-xl shadow-smooth">
                {employees.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">
                        No approved users found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (Username)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employees.map(emp => (
                                    <tr key={emp._id} className="hover:bg-secondary-gray transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {emp.name} (<span className="text-gray-500">{emp.username}</span>)
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                                        <td className="px-6 py-4 text-sm font-semibold">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                emp.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                'bg-accent-teal/10 text-accent-teal'
                                            }`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {/* VIEW/UPDATE Button */}
                                            <Link to={`/admin/manage-user/${emp._id}`} className="text-primary-blue hover:text-indigo-700 border border-primary-blue/50 px-3 py-1 rounded text-xs shadow-sm">
                                                View/Edit
                                            </Link>
                                            
                                            {/* DELETE Button */}
                                            {emp._id !== user.userId && (
                                                <button 
                                                    onClick={() => handleDelete(emp._id, emp.name)} 
                                                    className="text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded text-xs shadow-sm"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeView;