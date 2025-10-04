// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
// Theme hooks and button components are removed

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    // Note: Dark mode classes are removed since the toggle is gone
    <div className="min-h-screen flex items-center justify-center bg-secondary-gray relative"> 
      <div className="bg-white p-10 rounded-xl shadow-elevate w-full max-w-md transform transition duration-500 hover:scale-[1.01]">
        
        {/* THEME BUTTON ABSOLUTE PLACEMENT REMOVED */}
        
        <h2 className="text-4xl font-extrabold text-primary-blue text-center mb-2">
          TaskFlow Portal
        </h2>
        <p className="text-center text-gray-500 mb-8">Sign in to manage your tasks.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
            className="w-full px-5 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full px-5 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
          />
          
          <button 
            type="submit"
            className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold text-lg shadow-smooth hover:bg-indigo-600 transition duration-200"
          >
            Sign In
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center text-sm">{error}</p>}
        
        <p className="mt-8 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-accent-teal hover:underline font-medium block mb-2">
            Forgot Password?
          </Link>
          Don't have an account? 
          <Link to="/register" className="text-accent-teal hover:underline ml-1 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;