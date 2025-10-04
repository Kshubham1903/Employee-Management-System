// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function Register() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', secretToken: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); 
  const { login } = useAuth(); // Used for auto-login after successful admin registration

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('/register', formData);
      
      if (res.status === 201) {
          // Admin logs in immediately
          alert("Admin account created successfully! Logging you in.");
          login(formData.username, formData.password); 
      } else {
          // Pending Employee
          setSuccess(res.data.message); 
      }
      
      setFormData({ name: '', username: '', email: '', password: '', secretToken: '' });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-gray">
      <div className="bg-white p-10 rounded-xl shadow-elevate w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-primary-blue">
          Register for Access
        </h2>
        {success && <div className="p-3 mb-4 bg-accent-teal/20 text-accent-teal border border-accent-teal rounded">{success}</div>}
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-accent-teal focus:border-accent-teal" />
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-accent-teal focus:border-accent-teal" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-accent-teal focus:border-accent-teal" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-accent-teal focus:border-accent-teal" />
          
          <div className="pt-2">
            <input type="password" name="secretToken" placeholder="Admin Secret Token (Optional)" value={formData.secretToken} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
            <p className="text-xs text-gray-500 mt-1">Use Secret token to Register as "Admin"</p>
          </div>

          <button type="submit" className="w-full bg-primary-blue text-white py-3 rounded-xl font-semibold shadow-smooth hover:bg-primary-blue/90 transition mt-6">
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? 
          <Link to="/login" className="text-accent-teal hover:underline ml-1 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;