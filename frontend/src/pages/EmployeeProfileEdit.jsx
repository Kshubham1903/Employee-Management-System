// frontend/src/pages/EmployeeProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeProfileEdit = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');




    useEffect(() => {
        // Fetch current user data to pre-fill the form
        const fetchProfile = async () => {
            try {
                // FIX: Call the new, specific endpoint
                const res = await axios.get('/api/employee/me'); 
                
                // Ensure form data is set correctly
                setFormData({ name: res.data.user.name, email: res.data.user.email });
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            // Use the new /api/employee/update-info route
            const res = await axios.post('/api/employee/update-info', formData);
            setSuccess(res.data.message);
            
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed.');
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Profile...</div>;

    return (
        <div className="bg-secondary-gray min-h-screen p-6 lg:p-10">
            <div className="bg-white p-8 rounded-xl shadow-elevate max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h2 className="text-3xl font-bold text-primary-blue">Edit Your Profile</h2>
                    <button 
                        onClick={() => navigate('/employee/dashboard')} 
                        className="text-gray-600 hover:text-primary-blue transition text-sm font-semibold"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                {success && <div className="p-3 mb-4 bg-accent-teal/20 text-accent-teal border border-accent-teal rounded">{success}</div>}
                {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-accent-teal" />
                    </div>

                    <p className="text-sm text-gray-500 pt-2 border-t">Note: Password changes are restricted for security. Contact Admin if required.</p>

                    <button type="submit" className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold hover:bg-primary-blue/90 transition shadow-md">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmployeeProfileEdit;