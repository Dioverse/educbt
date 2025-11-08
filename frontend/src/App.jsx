import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';

// Question Bank Pages
import QuestionList from './pages/QuestionBank/QuestionList';
import CreateQuestion from './pages/QuestionBank/CreateQuestion';
import EditQuestion from './pages/QuestionBank/EditQuestion';
import QuestionDetail from './pages/QuestionBank/QuestionDetail';

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
          <Route path="/" element={<MainLayout />}>
            {/* Question Bank Routes */}
            <Route path="questions" element={<QuestionList />} />
            <Route path="questions/create" element={<CreateQuestion />} />
            <Route path="questions/:id" element={<QuestionDetail />} />
            <Route path="questions/:id/edit" element={<EditQuestion />} />
            
            {/* Home */}
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

// Home Page Component
function HomePage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to CBT System
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Computer-Based Testing Platform
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Question Bank</h3>
          <p className="text-gray-600 mb-4">Manage your question library</p>
          <a
            href="/questions"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Questions
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md opacity-50">
          <h3 className="text-lg font-semibold mb-2">Exams</h3>
          <p className="text-gray-600 mb-4">Create and manage exams</p>
          <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
            Coming in Phase 2
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md opacity-50">
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <p className="text-gray-600 mb-4">View exam results</p>
          <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
            Coming in Phase 5
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;