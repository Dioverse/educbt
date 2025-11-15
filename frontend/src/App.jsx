import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import RegisterAdmin from './pages/Auth/RegisterAdmin';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ImportStudents from './pages/Admin/ImportStudents';
import ImportSupervisors from './pages/Admin/ImportSupervisors';
import UserManagement from './pages/Admin/UserManagement';
import ExamResults from './pages/Results/ExamResults';

// Question Bank Pages
import QuestionList from './pages/QuestionBank/QuestionList';
import CreateQuestion from './pages/QuestionBank/CreateQuestion';
import ImportQuestions from './pages/QuestionBank/ImportQuestions';

// Exam Pages
import ExamList from './pages/Exams/ExamList';
import CreateExam from './pages/Exams/CreateExam';
import ViewExam from './pages/Exams/ViewExam';
import EditExam from './pages/Exams/EditExam';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import PreExamScreen from './pages/Student/PreExamScreen';
import ExamSession from './pages/Student/ExamSession';
import ExamResult from './pages/Student/ExamResult';

// Grading Pages
import GradingDashboard from './pages/Grading/GradingDashboard';
import GradeAnswer from './pages/Grading/GradeAnswer';
import RubricsList from './pages/Grading/RubricsList';
import CreateRubric from './pages/Grading/CreateRubric';
import BulkGrading from './pages/Grading/BulkGrading';
import PublishResults from './pages/Grading/PublishResults';

// Proctoring Pages
import LiveMonitoring from './pages/Proctoring/LiveMonitoring';
import SessionDetails from './pages/Proctoring/SessionDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register-admin" element={<RegisterAdmin />} />

          {/* Protected Routes with MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on role */}
            <Route index element={<RoleBasedRedirect />} />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users/import-students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ImportStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users/import-supervisors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ImportSupervisors />
                </ProtectedRoute>
              }
            />

            {/* Question Bank Routes - Admin & Supervisor */}
            <Route
              path="questions"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <QuestionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="questions/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <CreateQuestion />
                </ProtectedRoute>
              }
            />
            <Route
              path="questions/:questionId/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <CreateQuestion />
                </ProtectedRoute>
              }
            />
            {/* MOVED INSIDE: Import Questions */}
            <Route
              path="questions/import"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <ImportQuestions />
                </ProtectedRoute>
              }
            />

            {/* Exam Routes - Admin & Supervisor */}
            <Route
              path="exams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <ExamList />
                </ProtectedRoute>
              }
            />
            <Route
              path="exams/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <CreateExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="exams/:examId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <ViewExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="exams/:examId/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <EditExam />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/exam/:examId/start"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PreExamScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/exam/:attemptId/session"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/exam/:attemptId/result"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/results/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ExamResult />
                </ProtectedRoute>
              }
            />

            {/* Grading Routes - Admin & Supervisor */}
            <Route
              path="grading/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <GradingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/answer/:answerId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <GradeAnswer />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/rubrics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <RubricsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/rubrics/create"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <CreateRubric />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/rubrics/:rubricId/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <CreateRubric />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/bulk"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <BulkGrading />
                </ProtectedRoute>
              }
            />
            <Route
              path="grading/publish"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <PublishResults />
                </ProtectedRoute>
              }
            />

            {/* MOVED INSIDE: Proctoring Routes - Admin & Supervisor */}
            <Route
              path="proctoring/live/:examId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <LiveMonitoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="proctoring/session/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <SessionDetails />
                </ProtectedRoute>
              }
            />
          </Route>

           <Route
              path="/exams/:examId/results"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <ExamResults  />
                </ProtectedRoute>
              }
            />
            

          

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

// Role-based redirect component
function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const dashboardMap = {
    admin: '/admin/dashboard',
    supervisor: '/grading/dashboard',
    student: '/student/dashboard',
  };

  return <Navigate to={dashboardMap[user.role] || '/auth/login'} replace />;
}

export default App;