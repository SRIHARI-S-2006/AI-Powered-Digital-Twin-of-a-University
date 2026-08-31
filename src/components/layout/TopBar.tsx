import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, GraduationCap, ArrowLeft } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/admissions': 'Admissions',
  '/departments': 'Departments',
  '/courses': 'Courses',
  '/faculty': 'Faculty',
  '/classrooms': 'Classrooms',
  '/enrollments': 'Enrollments',
  '/attendance': 'Attendance',
  '/examinations': 'Examinations',
  '/timetable': 'Timetable',
  '/faculty-workload': 'Faculty Workload',
  '/hostel-rooms': 'Hostel Rooms',
  '/hostel-allocations': 'Hostel Allocations',
  '/clubs': 'Clubs',
  '/club-memberships': 'Club Memberships',
  '/events': 'Events',
  '/event-participants': 'Event Participants',
  '/sports-teams': 'Sports Teams',
  '/sports-participation': 'Sports Participation',
  '/library-books': 'Library Books',
  '/library-transactions': 'Library Transactions',
  '/transport-routes': 'Transport Routes',
  '/transport-allocations': 'Transport Allocations',
  '/health-records': 'Health Records',
  '/visitor-logs': 'Visitor Logs',
  '/companies': 'Companies',
  '/placement-drives': 'Placement Drives',
  '/placement-applications': 'Placement Applications',
  '/research-projects': 'Research Projects',
  '/research-participants': 'Research Participants',
  '/alumni': 'Alumni',
  '/fee-structure': 'Fee Structure',
  '/finance': 'Finance',
  '/inventory': 'Inventory',
  '/grievances': 'Grievances',
  '/feedback': 'Feedback',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  // Find title - match exact or starts-with for nested routes
  const pageTitle =
    routeTitles[location.pathname] ??
    Object.entries(routeTitles).find(([k]) => location.pathname.startsWith(k) && k !== '/')?.[1] ??
    'UniVerse';

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Back button (only shown if not on home/dashboard) */}
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center font-bold"
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
        )}
      </div>

      {/* User avatar on the right */}
      <div className="flex items-center">
        <div className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm">
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
