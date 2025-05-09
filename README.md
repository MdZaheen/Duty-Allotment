# CIE Room Allocation System

A comprehensive web application for managing professor duty allocation and student room allocation for CIE (Continuous Internal Evaluation) examinations.

## Features

### Module 1: Professor Duty Allocation
- **Round Robin Scheduling**: Automatically allocate professors to examination rooms using a fair round-robin algorithm.
- **Designation-based Priority**: Prioritizes allocation based on professor seniority (Professor > Associate > Assistant).
- **Balanced Duty Distribution**: Ensures equitable distribution of invigilation duties.
- **Excel Reports**: Generate and export professor duty charts for easy distribution.

### Module 2: Student Room Allocation
- **Section-wise Allocation**: Groups students by section to keep classmates together.
- **USN-based Seating**: Organized seating arrangement sorted by USN.
- **Adaptive Room Distribution**: Automatically splits sections across rooms when needed.
- **Integrated Attendance & Marks**: Track attendance and CIA marks in a single system.
- **Excel Export**: Generate printable seating arrangement reports.

## Tech Stack

- **Frontend**: Next.js (React), TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: Simple admin login (can be extended with NextAuth)
- **Export Functionality**: ExcelJS for generating Excel reports

## Getting Started

### Prerequisites
- Node.js (version 14 or later)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cie-room-allocation.git
cd cie-room-allocation
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_auth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## System Flow

1. **Login**: Access the system through the admin login.
2. **Setup Data**:
   - Add professors with their designations
   - Configure examination rooms with capacities
   - Set exam schedules (dates, shifts, times)
   - Add students with section and USN details
   - Register subjects for examination
3. **Generate Allocations**:
   - Run professor duty allocation
   - Create student room allocation for each subject
4. **Generate Reports**:
   - Export professor duty charts
   - Export student seating arrangements
   - Use reports for print distribution

## Usage Guide

### Professor Duty Allocation
1. Go to "Manage Professors" → Add or upload bulk professor data.
2. Go to "Manage Rooms" → Add exam rooms and their capacities.
3. Go to "Manage Schedule" → Add exam dates and shift times.
4. Go to "Generate Professor Allocation" → Run allocation logic.
5. Go to "Professor Duty Report" → View/download duty chart.

### Student Room Allocation
1. Go to "Manage Students" → Add students by section.
2. Go to "Manage Subjects" → Add subjects for examination.
3. Go to "Generate Student Allocation" → Create section-wise seating.
4. Go to "Student Seating Report" → View/download seating chart.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Your Name - Initial work

## Acknowledgments

- Thanks to NextJS and MongoDB for making modern web application development efficient.
- Inspired by the need for better exam management systems in educational institutions.
#   D u t y - A l l o t m e n t  
 #   D u t y - A l l o t m e n t  
 #   D u t y - A l l o t m e n t  
 