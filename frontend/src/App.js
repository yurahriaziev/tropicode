import { Navigate, Route, Routes } from 'react-router-dom';
import TestServer from './components/TestServer';
import Login from './pages/Login';
import PageNotFound from './pages/PageNotFound';
import AdminDash from './pages/AdminDash';
import TutorDash from './pages/TutorDash';
import StudentDash from './pages/StudentDash';
import GamePage from './pages/GamePage';
import HomeworkPage from './pages/HomeworkPage';
import StudentClassList from './components/StudentClassList';

function App() {
  return (
    <div className="site">
      <Routes>
        <Route path='/' element={<Navigate to='/login-student' replace/>} />
        <Route path='/login-student' element={<Login role='student'/>} />
        <Route path='/login-tutor' element={<Login role='tutor'/>} />
        <Route path='/server-test' element={<TestServer />} />
        <Route path='/admin-dash' element={<AdminDash />} />
        <Route path='/tutor-dash/:tutorId/:googleConn' element={<TutorDash />} />
        <Route path='/student-dash/:studentId' element={<StudentDash />} />
        <Route path='*' element={<PageNotFound />} />
        <Route path='/game' element={<GamePage />} />
        <Route path='/homework/:id' element={<HomeworkPage />} />
      </Routes>
    </div>
  );
}

export default App;
