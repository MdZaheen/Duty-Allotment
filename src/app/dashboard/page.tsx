export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome to the CIE Room Allocation System dashboard
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Professors</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
          <p className="text-sm text-gray-500 mt-1">Total registered</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Rooms</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">--</p>
          <p className="text-sm text-gray-500 mt-1">Total available</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Students</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
          <p className="text-sm text-gray-500 mt-1">Total registered</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700">Exam Schedules</h2>
          <p className="text-3xl font-bold text-orange-600 mt-2">--</p>
          <p className="text-sm text-gray-500 mt-1">Total scheduled</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/dashboard/professor-allocation" 
              className="inline-block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-600 font-medium"
            >
              Allocate Professors to Rooms
            </a>
            <a 
              href="/dashboard/student-allocation" 
              className="inline-block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-600 font-medium"
            >
              Allocate Students to Rooms
            </a>
            <a 
              href="/dashboard/reports/professor-duty" 
              className="inline-block px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md text-green-600 font-medium"
            >
              Generate Professor Duty Chart
            </a>
            <a 
              href="/dashboard/reports/student-seating" 
              className="inline-block px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-md text-orange-600 font-medium"
            >
              Generate Student Seating Chart
            </a>
          </div>
        </div>
      </div>

      {/* System Usage */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">System Usage Guide</h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-medium">Module 1: Professor Duty Allocation</h3>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>Add professor details</li>
                <li>Add room information</li>
                <li>Set exam schedules</li>
                <li>Generate professor allocation</li>
                <li>View or export duty report</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium">Module 2: Student Room Allocation</h3>
              <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
                <li>Add student information by section</li>
                <li>Add subject details</li>
                <li>Generate student room allocation</li>
                <li>View or export seating arrangement</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 