import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PublicListsPage from './pages/PublicListsPage';
import ListDetailsPage from './pages/ListDetailsPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AcceptableUsePolicy from './pages/AcceptableUsePolicy';
import DMCA from './pages/DMCA';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/lists" element={<PublicListsPage />} />
        <Route path="/lists/:id" element={<ListDetailsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/acceptable-use-policy" element={<AcceptableUsePolicy />} />
        <Route path="/dmca-policy" element={<DMCA />} />
      </Routes>
    </Router>
  );
}

export default App;
