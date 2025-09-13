
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard31 from './pages/Dashboard31';
import TasksPage from './pages/Tasks/TasksPage';
import Meetings from './pages/Meetings/Meetings';
import TestValidation from './TestValidation';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard31 />} />
            <Route path="dashboard" element={<Dashboard31 />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="test-validation" element={<TestValidation />} />
            <Route path="meetings" element={<Meetings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
