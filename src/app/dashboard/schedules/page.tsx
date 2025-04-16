'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Schedule {
  _id: string;
  date: string;
  shift: 'Morning' | 'Afternoon' | 'Evening';
  startTime: string;
  endTime: string;
  subjects?: string[];
  isActive: boolean;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    shift: 'Morning' as 'Morning' | 'Afternoon' | 'Evening',
    startTime: '09:00',
    endTime: '12:00',
    subjects: '',
    isActive: true
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/schedules');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort schedules by date
        const sortedData = [...data].sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        setSchedules(sortedData);
      }
    } catch (err) {
      setError('Failed to load schedules');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert subjects string to array if provided
    const subjectsArray = formData.subjects.trim() ? 
      formData.subjects.split(',').map(s => s.trim()) : 
      [];
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      subjects: subjectsArray,
      date: new Date(formData.date).toISOString()
    };
    
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add schedule');
      }
      
      // Reset form and refresh list
      setFormData({
        date: '',
        shift: 'Morning',
        startTime: '09:00',
        endTime: '12:00',
        subjects: '',
        isActive: true
      });
      setShowAddForm(false);
      fetchSchedules();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update schedule status');
      }
      
      // Refresh list
      fetchSchedules();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete schedule');
      }
      
      // Refresh list
      fetchSchedules();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Group schedules by date for better display
  const groupedSchedules: Record<string, Schedule[]> = {};
  schedules.forEach(schedule => {
    const dateStr = new Date(schedule.date).toLocaleDateString();
    if (!groupedSchedules[dateStr]) {
      groupedSchedules[dateStr] = [];
    }
    groupedSchedules[dateStr].push(schedule);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Exam Schedules</h1>
          <p className="mt-1 text-gray-600">
            Add, edit, or remove examination schedules
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showAddForm ? 'Cancel' : 'Add Schedule'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Schedule</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                  Shift <span className="text-red-500">*</span>
                </label>
                <select
                  id="shift"
                  name="shift"
                  required
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects (comma-separated)
                </label>
                <textarea
                  id="subjects"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CS101, MA102, PH103"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (available for allocation)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading schedules...</p>
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-700 mb-4">No examination schedules have been added yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Your First Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shift
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {daySchedules.map((schedule) => (
                      <tr key={schedule._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {schedule.shift}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {schedule.startTime} - {schedule.endTime}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {schedule.subjects && schedule.subjects.length > 0 ? 
                            schedule.subjects.join(', ') : 
                            '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          <button
                            onClick={() => handleStatusToggle(schedule._id, schedule.isActive)}
                            className={schedule.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                          >
                            {schedule.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="text-red-600 hover:text-red-900 ml-3"
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
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {schedules.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Schedules</p>
              <p className="text-xl font-semibold">{schedules.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Schedules</p>
              <p className="text-xl font-semibold">{schedules.filter(s => s.isActive).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Exam Days</p>
              <p className="text-xl font-semibold">{Object.keys(groupedSchedules).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-xl font-semibold">
                {schedules.filter(s => new Date(s.date) >= new Date() && s.isActive).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 