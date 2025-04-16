import { ReactNode } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard" 
                className="font-bold text-xl"
              >
                CIE Room Allocation System
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-white hover:text-gray-200"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] sticky top-16">
          <div className="px-4 py-6">
            <p className="text-gray-600 text-xs uppercase font-bold mb-4">Module 1</p>
            <nav className="space-y-2">
              <Link 
                href="/dashboard/professors" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Manage Professors
              </Link>
              <Link 
                href="/dashboard/rooms" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Manage Rooms
              </Link>
              <Link 
                href="/dashboard/schedules" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Manage Schedules
              </Link>
              <Link 
                href="/dashboard/professor-allocation" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Professor Allocation
              </Link>
            </nav>

            <p className="text-gray-600 text-xs uppercase font-bold mb-4 mt-8">Module 2</p>
            <nav className="space-y-2">
              <Link 
                href="/dashboard/students" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Manage Students
              </Link>
              <Link 
                href="/dashboard/subjects" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Manage Subjects
              </Link>
              <Link 
                href="/dashboard/student-allocation" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Student Allocation
              </Link>
            </nav>

            <p className="text-gray-600 text-xs uppercase font-bold mb-4 mt-8">Reports</p>
            <nav className="space-y-2">
              <Link 
                href="/dashboard/reports/professor-duty" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Professor Duty Report
              </Link>
              <Link 
                href="/dashboard/reports/student-seating" 
                className="block px-4 py-2 rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                Student Seating Report
              </Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 