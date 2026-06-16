import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ReceptionistPage from './pages/ReceptionistPage';
import DisplayPage from './pages/DisplayPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/receptionist" replace />} />
        <Route path="/receptionist" element={<ReceptionistPage />} />
        <Route path="/display" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;