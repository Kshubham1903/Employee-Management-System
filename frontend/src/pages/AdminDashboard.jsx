// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';

// --- Task Form Component (Used to create tasks) ---
const TaskForm = ({ employees, onCreateTask }) => {
    // Initial task state defaults to the first approved employee if available
    const initialTask = { title: '', description: '', deadline: '', assignedTo: employees[0]?._id || '' };
    const [newTask, setNewTask] = useState(initialTask);
    
    // Ensure assignedTo is set if employees load late
    useEffect(() => {
        if (employees.length > 0 && !newTask.assignedTo) {
            setNewTask(prev => ({ ...prev, assignedTo: employees[0]._id }));
        }
    }, [employees]);

    const handleNewTaskChange = (e) => { setNewTask({ ...newTask, [e.target.name]: e.target.value }); };

    const handleCreate = (e) => {
        e.preventDefault();
        onCreateTask(newTask);
        setNewTask(initialTask);
    };

    return (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-smooth space-y-4">
            <h3 className="text-xl font-bold text-primary-blue border-b pb-2">Assign New Task</h3>
            <input type="text" name="title" placeholder="Task Title" value={newTask.title} onChange={handleNewTaskChange} required className="w-full p-3 border rounded-lg focus:ring-accent-teal" />
            <textarea name="description" placeholder="Task Description" value={newTask.description} onChange={handleNewTaskChange} required className="w-full p-3 border rounded-lg focus:ring-accent-teal"></textarea>
            <input type="date" name="deadline" value={newTask.deadline} onChange={handleNewTaskChange} required className="w-full p-3 border rounded-lg focus:ring-accent-teal" />
            
            <select name="assignedTo" value={newTask.assignedTo} onChange={handleNewTaskChange} required className="w-full p-3 border rounded-lg focus:ring-accent-teal">
                <option value="" disabled>Select Employee</option>
                {/* Shows only approved employees */}
                {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.username})</option>
                ))}
            </select>
            <button type="submit" className="w-full bg-accent-teal text-white py-3 rounded-lg font-semibold hover:bg-accent-teal/90 transition shadow-md">Create Task</button>
        </form>
    );
};
// ---------------------------------------------------


function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/dashboard');
      setTasks(res.data.tasks);
      setEmployees(res.data.employees);
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

  const handleCreateTask = async (taskData) => {
    setError('');
    try {
      await axios.post('/api/admin/tasks', taskData);
      alert('Task created successfully!');
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task.');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    setError('');
    if (!window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
      return; 
    }

    try {
      await axios.delete(`/api/admin/tasks/${taskId}`);
      alert('Task deleted successfully!');
      fetchData(); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  const totalEmployees = employees.length;
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
                    
                    {/* View Employees Link */}
                    <Link 
                        to="/admin/view-employees"
                        className="text-primary-blue border border-primary-blue px-4 py-2 rounded-lg text-sm hover:bg-primary-blue hover:text-white transition shadow-sm"
                    >
                        View Employees
                    </Link>

                    {/* Pending Users / Approval Link (Fixed Integration) */}
                    <Link 
                        to="/admin/approval"
                        className="text-white bg-red-600 border border-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition shadow-md"
                    >
                        Pending Users
                    </Link>
                    
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

        {/* Main Content Area */}
        <div className="container mx-auto p-6 lg:p-10">
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Total Employees" value={totalEmployees} icon="👥" color="bg-indigo-600" />
                <StatCard title="Pending Tasks" value={pendingTasks} icon="⏳" color="bg-yellow-600" />
                <StatCard title="Completed Tasks" value={completedTasks} icon="✅" color="bg-accent-teal" />
            </div>
            
            {/* Main Grid: Form and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task Form Component (Left Column) */}
                <div className="lg:col-span-1">
                    <TaskForm employees={employees} onCreateTask={handleCreateTask} />
                </div>

                {/* Task List (Right Column) */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-xl shadow-smooth">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">All Tasks Overview</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Assigned To</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {tasks.map(task => (
                                        <tr key={task._id} className="hover:bg-secondary-gray transition duration-150">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {task.title}
                                                <p className="text-xs text-gray-500 mt-0.5">Assigned to: {task.assignedTo?.name || 'N/A'}</p>
                                            </td>
                                            
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(task.deadline).toLocaleDateString()}
                                            </td>
                                            
                                            <td className="px-6 py-4">
                                                <StatusPill status={task.status} />
                                            </td>

                                            {/* DELETE BUTTON CELL */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded text-xs shadow-sm transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default AdminDashboard;