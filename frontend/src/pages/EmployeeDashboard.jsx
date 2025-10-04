// frontend/src/pages/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import StatusPill from '../components/StatusPill';
import StatCard from '../components/StatCard';

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('/api/employee/dashboard');
      setTasks(res.data.tasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskAction = async (taskId, action) => {
    try {
      await axios.post(`/api/employee/tasks/${taskId}/update`, { action });
      alert(`Task successfully ${action}d.`);
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} task.`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Employee Dashboard...</div>;

  const totalAssigned = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-secondary-gray">
        {/* Header/Nav Bar */}
        <header className="bg-white shadow-smooth sticky top-0 z-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-blue">
                    Optimistic <span className="text-accent-teal">TaskFlow</span>
                </h1>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-600 hidden sm:inline">Welcome, {user.name}</span>
                    {/* Logout Button */}
                    <button 
                        onClick={logout} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
        
        <div className="container mx-auto p-6 lg:p-10">
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Total Assigned" value={totalAssigned} icon="📦" color="bg-indigo-600" />
                <StatCard title="Remaining (Pending)" value={pendingTasks} icon="⚠️" color="bg-yellow-600" />
                <StatCard title="Completed" value={completedTasks} icon="🎉" color="bg-accent-teal" />
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Task List</h2>
            <div className="overflow-x-auto bg-white p-6 rounded-xl shadow-smooth">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {tasks.map(task => (
                            <tr key={task._id} className="hover:bg-secondary-gray transition duration-150">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <p className="font-bold">{task.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.deadline).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <StatusPill status={task.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {task.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleTaskAction(task._id, 'accept')} className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded text-xs shadow-sm">Accept</button>
                                            <button onClick={() => handleTaskAction(task._id, 'reject')} className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded text-xs shadow-sm">Reject</button>
                                        </>
                                    )}
                                    {task.status === 'Accepted' && (
                                        <button onClick={() => handleTaskAction(task._id, 'complete')} className="bg-accent-teal text-white px-3 py-1 rounded text-xs hover:bg-accent-teal/90 transition shadow-md">Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

export default EmployeeDashboard;