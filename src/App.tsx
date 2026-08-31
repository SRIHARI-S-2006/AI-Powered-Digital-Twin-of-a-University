import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { ToastContainer } from './components/ui/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/academic/Students';
import StudentProfile from './pages/academic/StudentProfile';
import AdmissionsPage from './pages/academic/Admissions';
import DepartmentsPage from './pages/academic/Departments';
import CoursesPage from './pages/academic/Courses';
import FacultyPage from './pages/academic/Faculty';
import ClassroomsPage from './pages/academic/Classrooms';
import EnrollmentsPage from './pages/academic/Enrollments';
import AttendancePage from './pages/academic/Attendance';
import ExaminationsPage from './pages/academic/Examinations';
import TimetablePage from './pages/academic/Timetable';
import FacultyWorkloadPage from './pages/academic/FacultyWorkload';

// Campus
import { HostelRoomsPage, HostelAllocationsPage } from './pages/campus/Hostel';
import { ClubsPage, ClubMembershipsPage, EventsPage, EventParticipantsPage, SportsTeamsPage, SportsParticipationPage } from './pages/campus/Campus';

// Support
import { LibraryBooksPage, LibraryTransactionsPage, TransportRoutesPage, TransportAllocationsPage, HealthRecordsPage, VisitorLogsPage } from './pages/support/Support';

// Career
import { CompaniesPage, PlacementDrivesPage, PlacementApplicationsPage, ResearchProjectsPage, ResearchParticipantsPage, AlumniPage } from './pages/career/Career';

// Admin
import { FeeStructurePage, FinancePage, InventoryPage, GrievancesPage, FeedbackPage } from './pages/admin/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Academic */}
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="enrollments" element={<EnrollmentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="examinations" element={<ExaminationsPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="faculty-workload" element={<FacultyWorkloadPage />} />

            {/* Campus */}
            <Route path="hostel-rooms" element={<HostelRoomsPage />} />
            <Route path="hostel-allocations" element={<HostelAllocationsPage />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route path="club-memberships" element={<ClubMembershipsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="event-participants" element={<EventParticipantsPage />} />
            <Route path="sports-teams" element={<SportsTeamsPage />} />
            <Route path="sports-participation" element={<SportsParticipationPage />} />

            {/* Support */}
            <Route path="library-books" element={<LibraryBooksPage />} />
            <Route path="library-transactions" element={<LibraryTransactionsPage />} />
            <Route path="transport-routes" element={<TransportRoutesPage />} />
            <Route path="transport-allocations" element={<TransportAllocationsPage />} />
            <Route path="health-records" element={<HealthRecordsPage />} />
            <Route path="visitor-logs" element={<VisitorLogsPage />} />

            {/* Career */}
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="placement-drives" element={<PlacementDrivesPage />} />
            <Route path="placement-applications" element={<PlacementApplicationsPage />} />
            <Route path="research-projects" element={<ResearchProjectsPage />} />
            <Route path="research-participants" element={<ResearchParticipantsPage />} />
            <Route path="alumni" element={<AlumniPage />} />

            {/* Admin */}
            <Route path="fee-structure" element={<FeeStructurePage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="grievances" element={<GrievancesPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
