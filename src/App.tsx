import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from './layouts/MainLayout';
import { Splash } from './pages/Splash';
import { Dashboard } from './pages/Dashboard';

import { UploadCenter } from './pages/UploadCenter';

import { ProcessingCenter } from './pages/ProcessingCenter';

import { ResultsCenter } from './pages/ResultsCenter';

import { SearchCenter } from './pages/SearchCenter';
import { Settings } from './pages/Settings';
import { History } from './pages/History';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Splash />;
  }

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-cyan-100/40 blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-blue-200/40 to-purple-200/40 blur-[120px]"
        />
      </div>

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadCenter />} />
          <Route path="/processing" element={<ProcessingCenter />} />
          <Route path="/results" element={<ResultsCenter />} />
          <Route path="/search" element={<SearchCenter />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
