// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard31 from './pages/Dashboard31';
import TasksPage from './pages/Tasks/TasksPage';
import Meetings from './pages/Meetings/Meetings';
import TestValidation from './TestValidation';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard31 />} />
        <Route path="dashboard" element={<Dashboard31 />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="test-validation" element={<TestValidation />} />
        <Route path="meetings" element={<Meetings />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
