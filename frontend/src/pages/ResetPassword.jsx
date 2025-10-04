// frontend/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!token) {
      return setError('Invalid or missing reset token.');
    }

    try {
      const res = await axios.post('/reset-password', { token, newPassword });
      setMessage(res.data.message);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-gray">
      <div className="bg-white p-10 rounded-xl shadow-elevate w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-primary-blue">
          Set New Password
        </h2>
        
        {message && <div className="p-3 mb-4 bg-accent-teal/20 text-accent-teal border border-accent-teal rounded">{message}</div>}
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

        {!token && <p className="text-red-500 text-center">Missing reset token. Please check your email link.</p>}
        
        {token && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input 
              type="password" 
              placeholder="New Password (min 6 chars)" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
              minLength="6"
              className="w-full px-5 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-accent-teal"
            />
            <input 
              type="password" 
              placeholder="Confirm New Password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
              className="w-full px-5 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-accent-teal"
            />
            
            <button 
              type="submit"
              className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold text-lg shadow-smooth hover:bg-primary-blue/90 transition"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link to="/login" className="text-accent-teal hover:underline ml-1 font-medium">
            Return to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;