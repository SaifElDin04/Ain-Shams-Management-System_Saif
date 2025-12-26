import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CurriculumProvider } from './context/CurriculumContext';
import { AdmissionProvider } from './context/AdmissionContext';
import { AnnouncementProvider } from './context/AnnouncementContext';

import { Navbar } from './components/common';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public pages (NAMED exports)
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// User pages (NAMED exports)
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/curriculum/CoursesPage';
import { CourseDetailPage } from './pages/curriculum/CourseDetailPage';
import { AssignmentsPage } from './pages/curriculum/AssignmentsPage';
import { GradesPage } from './pages/curriculum/GradesPage';
import { AdmissionPage } from './pages/admission/AdmissionPage';

// Admin pages (NAMED exports ✅)
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';

// Community pages (DEFAULT exports ✅)
import MessagesPage from './pages/messages/MessagesPage';
import EnhancedAnnouncementsPage from './pages/community/EnhancedAnnouncementsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurriculumProvider>
          <AdmissionProvider>
            <AnnouncementProvider>
              <div className="min-h-screen bg-gray-50">
                <Navbar />

                <Routes>
                  {/* Public */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* User (protected) */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/courses"
                    element={
                      <ProtectedRoute>
                        <CoursesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/courses/:courseId"
                    element={
                      <ProtectedRoute>
                        <CourseDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/assignments"
                    element={
                      <ProtectedRoute>
                        <AssignmentsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/grades"
                    element={
                      <ProtectedRoute>
                        <GradesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/admission" element={<AdmissionPage />} />

                  {/* Community */}
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/announcements"
                    element={
                      <ProtectedRoute>
                        <EnhancedAnnouncementsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin */}
                  <Route
                    path="/admin/applications"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <AdminApplicationsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/courses"
                    element={
                      <ProtectedRoute roles={['admin']}>
                        <AdminCoursesPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all (MUST be last) */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </AnnouncementProvider>
          </AdmissionProvider>
        </CurriculumProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
