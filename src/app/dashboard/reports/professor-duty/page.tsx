'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProfessorDuty {
  _id: string;
  professor: {
    _id: string;
    name: string;
    designation: string;
  };
  room: {
    _id: string;
    number: string;
  };
  date: string;
  shift: string;
  schedule: {
    startTime: string;
    endTime: string;
  };
}

export default function ProfessorDutyReport() {
  const [duties, setDuties] = useState<ProfessorDuty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedDuties, setGroupedDuties] = useState<Record<string, ProfessorDuty[]>>({});
  const [professors, setProfessors] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all professors
        const professorsRes = await fetch('/api/professors');
        const professorsData = await professorsRes.json();
        setProfessors(professorsData);
        
        // Fetch all duties with populated data
        const res = await fetch('/api/professor-duties');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setDuties(data);
          
          // Group duties by date and shift for easy display
          const grouped: Record<string, ProfessorDuty[]> = {};
          data.forEach((duty: ProfessorDuty) => {
            const key = `${duty.date}-${duty.shift}`;
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(duty);
          });
          
          setGroupedDuties(grouped);
        }
      } catch (err) {
        setError('Failed to load professor duties');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleExport = () => {
    // Redirect to the export API endpoint
    window.location.href = '/api/export-professor-duty';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professor Duty Report</h1>
          <p className="mt-1 text-gray-600">
            View and export professor invigilation duties
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export to Excel
          </button>
          
          <Link 
            href="/dashboard/professor-allocation" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Manage Allocation
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading duties...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      ) : Object.keys(groupedDuties).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-700 mb-4">No professor duties have been allocated yet.</p>
          <Link 
            href="/dashboard/professor-allocation" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Allocate Professors Now
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Professors</p>
                <p className="text-2xl font-bold text-blue-600">{professors.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Duties Assigned</p>
                <p className="text-2xl font-bold text-blue-600">{duties.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Exam Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{Object.keys(groupedDuties).length}</p>
              </div>
            </div>
          </div>
          
          {/* Duty Chart */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-700 p-6 pb-2">Duty Chart</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Professor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {duties.map((duty) => (
                    <tr key={duty._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(duty.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duty.shift}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duty.schedule.startTime} - {duty.schedule.endTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {duty.room.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {duty.professor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duty.professor.designation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 