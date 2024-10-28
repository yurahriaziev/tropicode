import { Route, Routes } from 'react-router-dom';
import TestServer from './components/TestServer';

function App() {
  return (
    <div className="site">
      <Routes>
        <Route path='/server-test' element={<TestServer />} />
      </Routes>
    </div>
  );
}

export default App;
