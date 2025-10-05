// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import StatCard from '../components/StatCard'; 
import StatusPill from '../components/StatusPill'; 
import NotificationCenter from '../components/NotificationCenter'; 

// --- Task Form Component (unchanged logic) ---
const TaskForm = ({ employees, onCreateTask }) => {
    const initialTask = { title: '', description: '', deadline: '', assignedTo: '' };
    const [newTask, setNewTask] = useState(initialTask);
    
    useEffect(() => {
        if (employees.length > 0 && !newTask.assignedTo) {
            setNewTask(prev => ({ ...prev, assignedTo: employees[0]._id }));
        }
    }, [employees, newTask.assignedTo]);

    const handleChange = (e) => { 
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value })); 
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newTask.assignedTo) {
            alert("Please select an employee.");
            return;
        }
        onCreateTask(newTask);
        setNewTask(prev => ({ ...initialTask, assignedTo: prev.assignedTo })); 
    };

    return (
        // FORM CONTAINER: bg-white with strong shadow, designed for 1/3 width
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl mb-10 lg:mb-0">
            <h3 className="text-2xl font-extrabold text-gray-700 mb-4 border-b-4 border-accent-teal/50 pb-2">Assign New Task</h3>
            
            <div className='space-y-4'>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Task Title</label>
                    <input type="text" name="title" placeholder="E.g., Design UI Mockups" value={newTask.title} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-teal focus:border-accent-teal transition duration-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Task Description</label>
                    <textarea type="text" name="description" placeholder="Detailed instructions for the task..." value={newTask.description} onChange={handleChange} required rows="3" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-teal focus:border-accent-teal transition duration-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Deadline Date</label>
                    <input type="date" name="deadline" value={newTask.deadline} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-teal hover:border-indigo-400 transition duration-200" />
                </div>
            </div>
            
            <div className="pt-2">
                <label className="text-sm font-medium text-gray-700 block mb-2">Assign To (Select one employee)</label>
                <select 
                    name="assignedTo" 
                    value={newTask.assignedTo} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-teal hover:border-indigo-400 transition duration-200"
                >
                    <option value="" disabled>Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.username})</option>
                    ))}
                </select>
            </div>

            <button type="submit" className="w-full bg-accent-teal text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-teal-600 transition duration-300 transform hover:scale-[1.01] tracking-wider mt-6">
                CREATE TASK
            </button>
        </form>
    );
};
// ---------------------------------------------------

// Helper function to render a task table
const renderTaskTable = (tasks, title, emptyMessage, headerBgClass) => (
    // This wrapper is designed to be full width when rendered alone
    <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2 border-gray-200">{title} ({tasks.length})</h2>
        <div className="overflow-x-auto">
            {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={headerBgClass}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Title / Assigned To</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Deadline</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-primary-blue uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {tasks.map(task => (
                            <tr key={task._id} className="group hover:bg-indigo-50/50 transition duration-150"> 
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
                                        onClick={() => window.confirm("Are you sure you want to delete this task?") && axios.delete(`/api/admin/tasks/${task._id}`).then(() => location.reload())}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-xs shadow-sm transition duration-200 hover:bg-red-700 transform hover:scale-105"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);


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
    // This is primarily for the Completed Tasks Archive section
    try {
      await axios.delete(`/api/admin/tasks/${taskId}`);
      fetchData();
    } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl text-primary-blue font-extrabold bg-secondary-gray">Loading Dashboard Data...</div>;


  const pendingTasks = tasks.filter(task => task.status === 'Pending');
  const acceptedTasks = tasks.filter(task => task.status === 'Accepted');
  const rejectedTasks = tasks.filter(task => task.status === 'Rejected');
  const completedTasks = tasks.filter(task => task.status === 'Completed');
  
  const totalEmployees = employees.length;
  const pendingTasksCount = pendingTasks.length;
  const completedTasksCount = completedTasks.length;
  const acceptedTasksCount = acceptedTasks.length;
  const rejectedTasksCount = rejectedTasks.length;


  return (
    <div className="min-h-screen bg-secondary-gray">
        {/* Header/Nav Bar */}
        <header className="bg-white shadow-lg sticky top-0 z-10">
            <div className="container mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-primary-blue tracking-wider">
                    Optimistic <span className="text-accent-teal">TaskFlow</span>
                </h1>
                <div className="flex items-center space-x-4">
                    
                    <NotificationCenter />
                    
                    {/* View Employees Link */}
                    <Link 
                        to="/admin/view-employees"
                        className="text-primary-blue border-2 border-primary-blue px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-blue hover:text-white transition duration-300 shadow-md"
                    >
                        View Employees
                    </Link>

                    {/* Pending Users / Approval Link */}
                    <Link 
                        to="/admin/approval"
                        className="text-white bg-red-600 border border-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition duration-300 shadow-md"
                    >
                        Pending Users
                    </Link>
                    
                    {/* Logout Button */}
                    <button 
                        onClick={logout} 
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition duration-300 shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>

        {/* Main Content Area */}
        <div className="container mx-auto max-w-7xl p-6 lg:p-10">
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Employees" value={totalEmployees} icon="👥" color="bg-indigo-600" />
                <StatCard title="Pending" value={pendingTasksCount} icon="⏳" color="bg-yellow-600" />
                <StatCard title="Accepted" value={acceptedTasksCount} icon="▶️" color="bg-blue-500" />
                <StatCard title="Completed" value={completedTasksCount} icon="✅" color="bg-accent-teal" />
            </div>
            
            {/* --- 1. FORM AND PENDING TASKS GRID (Side-by-Side on Desktop) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                
                {/* A. Task Form (Left Column: 1/3 width) */}
                <div className="lg:col-span-1">
                    <TaskForm employees={employees} onCreateTask={handleCreateTask} />
                </div>

                {/* B. Pending Tasks Table (Right Column: 2/3 width) */}
                <div className="lg:col-span-2">
                    {renderTaskTable(
                        pendingTasks, 
                        "Pending Tasks (Awaiting Acceptance)", 
                        "All tasks are accepted or completed.", 
                        "bg-yellow-100/70"
                    )}
                </div>
            </div>
            
            {/* --- 2. ACCEPTED TASKS (FULL WIDTH BLOCK) --- */}
            {renderTaskTable(
                acceptedTasks, 
                "Accepted Tasks (In Progress)", 
                "No tasks currently in progress.", 
                "bg-blue-100/70"
            )}

            {/* --- 3. REJECTED TASKS (FULL WIDTH BLOCK) --- */}
            {renderTaskTable(
                rejectedTasks, 
                "Rejected Tasks (Requires Review)", 
                "No tasks have been rejected.", 
                "bg-red-100/70"
            )}
            
            {/* 4. COMPLETED TASKS ARCHIVE (FULL WIDTH BLOCK) */}
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-700">Completed Tasks Archive</h2>
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl">
                <div className="overflow-x-auto">
                    {completedTasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No tasks have been marked as completed yet.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-accent-teal/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-accent-teal uppercase tracking-wider">Title / Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-accent-teal uppercase tracking-wider">Completion Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-accent-teal uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-accent-teal uppercase tracking-wider">Archive Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {completedTasks.map(task => (
                                    <tr key={task._id} className="group hover:bg-indigo-50/50 transition duration-150">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {task.title}
                                            <p className="text-xs text-gray-500 mt-0.5">Assigned to: {task.assignedTo?.name || 'N/A'}</p>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <StatusPill status={task.status} />
                                        </td>

                                        {/* ARCHIVE DELETE BUTTON */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => window.confirm("Delete this completed task permanently?") && handleDeleteTask(task._id)}
                                                className="bg-red-300 text-red-800 px-3 py-1 rounded text-xs shadow-sm transition duration-200 hover:bg-red-500 hover:text-white"
                                            >
                                                Delete Permanently
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default AdminDashboard;