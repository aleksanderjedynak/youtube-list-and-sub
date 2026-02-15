import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@/components/auth/LoginPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionsProvider } from '@/contexts/SubscriptionsContext';
import { Toaster } from '@/components/ui/sonner';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SubscriptionsProvider>
                  <DashboardLayout />
                  <Toaster richColors position="bottom-right" />
                </SubscriptionsProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
