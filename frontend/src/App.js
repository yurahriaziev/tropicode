import { Navigate, Route, Routes } from 'react-router-dom';
import TestServer from './components/TestServer';
import Login from './pages/Login';
import PageNotFound from './pages/PageNotFound';

function App() {
  return (
    <div className="site">
      <Routes>
        <Route path='/' element={<Navigate to='/login-student' replace/>} />
        <Route path='/login-student' element={<Login role='student'/>} />
        <Route path='/login-tutor' element={<Login role='tutor'/>} />
        <Route path='/server-test' element={<TestServer />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </div>
  );
}

export default App;
