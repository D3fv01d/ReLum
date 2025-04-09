import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Knowledge from './pages/Knowledge';
import KnowledgeDetail from './pages/KnowledgeDetail';
import Practice from './pages/Practice';

function App() {
  return (
    <div className="text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/knowledge/:categoryId" element={<KnowledgeDetail />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </div>
  );
}

export default App; 