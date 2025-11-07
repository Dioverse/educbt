import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

// Temporary Home Page Component
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-800">
          CBT System
        </h1>
        <p className="text-xl text-gray-600">
          Computer-Based Testing Platform
        </p>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            System Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Backend:</span>
              <span className="text-green-600 font-medium">
                http://localhost:8007
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Frontend:</span>
              <span className="text-green-600 font-medium">
                http://localhost:5173
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Ready for Phase 1
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Phase 0: Database Foundation Complete ✅
        </p>
      </div>
    </div>
  );
}

export default App;