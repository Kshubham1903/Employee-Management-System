// frontend/src/pages/ManageUser.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ManageUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Check: This page should ONLY be accessible by Admin
    if (user.role !== 'admin') {
        return <div className="p-8 text-center text-red-600 font-bold">403 Access Denied.</div>;
    }

    const [formData, setFormData] = useState({ name: '', email: '', username: '', role: '', newPassword: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUser = useCallback(async () => {
        if (!userId) {
            setError("Error: User ID is missing from the URL.");
            setLoading(false);
            return;
        }

        try {
            // Fetch ALL approved employees from the defined API
            const res = await axios.get(`/api/admin/employees/all`);
            const targetUser = res.data.employees.find(emp => emp._id === userId);
            
            if (targetUser) {
                setFormData({
                    name: targetUser.name,
                    email: targetUser.email,
                    username: targetUser.username,
                    role: targetUser.role,
                    newPassword: ''
                });
            } else {
                setError(`User ID "${userId}" not found or not approved.`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch user data for management.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const updateData = {
            name: formData.name,
            email: formData.email,
            newRole: formData.role,
        };
        if (formData.newPassword) {
            updateData.newPassword = formData.newPassword;
        }

        try {
            const res = await axios.post(`/api/admin/user/update/${userId}`, updateData);
            setSuccess(res.data.message);
            setFormData(prev => ({ ...prev, newPassword: '' })); 
            
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed.');
        }
    };

    if (loading) return <div className="p-4 text-center text-primary-blue font-semibold">Loading User Management Details...</div>;
    
    if (error && error.includes("User ID")) {
         return (
            <div className="bg-white p-8 rounded-xl shadow-elevate max-w-4xl mx-auto my-10 text-center">
                <p className='text-red-600 font-bold'>Error: {error}</p>
                <button onClick={() => navigate('/admin/view-employees')} className="mt-4 text-accent-teal hover:underline">← Back to Employee List</button>
            </div>
        );
    }
    
    if (!formData.name) {
         return (
            <div className="bg-white p-8 rounded-xl shadow-elevate max-w-4xl mx-auto my-10 text-center">
                <p className='text-gray-600'>Cannot load data. User may have been deleted.</p>
                <button onClick={() => navigate('/admin/view-employees')} className="mt-4 text-accent-teal hover:underline">← Back to Employee List</button>
            </div>
        );
    }


    return (
        <div className="bg-white p-8 rounded-xl shadow-elevate max-w-4xl mx-auto my-10">
            <h2 className="text-3xl font-bold text-primary-blue mb-6 border-b pb-2">Manage User: {formData.name}</h2>
            
            {success && <div className="p-3 mb-4 bg-accent-teal/20 text-accent-teal border border-accent-teal rounded">{success}</div>}
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className="block text-gray-700 font-medium">Username (Read-Only)</label>
                        <input type="text" value={formData.username} disabled className="w-full mt-1 p-3 border bg-gray-100 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal">
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-gray-700 font-medium">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal" />
                </div>

                <div className="pt-4 border-t">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Reset Password</h3>
                    <div>
                        <label className="block text-gray-700 font-medium">New Password</label>
                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Enter new password to reset" className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal" />
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold hover:bg-primary-blue/90 transition shadow-md">
                    Apply Updates
                </button>
            </form>
            <button onClick={() => navigate('/admin/view-employees')} className="mt-4 text-accent-teal hover:underline">← Back to Employee List</button>
        </div>
    );
};

export default ManageUser;