// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const res = await axios.post('/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process request.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-gray">
      <div className="bg-white p-10 rounded-xl shadow-elevate w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-primary-blue">
          Forgot Password
        </h2>
        
        {message && <div className="p-3 mb-4 bg-accent-teal/20 text-accent-teal border border-accent-teal rounded">{message}</div>}
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-gray-600">Enter your email address to receive a password reset link.</p>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            className="w-full px-5 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
          />
          
          <button 
            type="submit"
            className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold text-lg shadow-smooth hover:bg-primary-blue/90 transition duration-200"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link to="/login" className="text-accent-teal hover:underline ml-1 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;