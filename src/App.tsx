import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormPage from './pages/FormPage';
import TablePage from './pages/TablePage';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/table" element={<TablePage/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
