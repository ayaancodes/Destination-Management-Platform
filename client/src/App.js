import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import AddDestinationPage from './pages/AddDestinationPage';
import PublicListsPage from './pages/PublicListsPage';
import ListDetailsPage from './pages/ListDetailsPage';
import AdminPublicListsPage from './pages/AdminPublicListsPage'
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserListsPage from "./pages/UserListsPage";
import CreateListPage from "./pages/CreateListPage";
import AcceptableUsePolicy from './pages/AcceptableUsePolicy';
import AdminPage from './pages/AdminPage';
import DMCA from './pages/DMCA';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/adminView" element={<AdminPage />} />
        <Route path="/lists" element={<PublicListsPage />} />
        <Route path="/public-lists" element={<AdminPublicListsPage />} />
        <Route path="/my-lists" element={<UserListsPage />} />
        <Route path="/lists/:id/add-destination" element={<AddDestinationPage />} />
        <Route path="/create-list" element={<CreateListPage />} />
        <Route path="/lists/:id" element={<ListDetailsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />s
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/acceptable-use-policy" element={<AcceptableUsePolicy />} />
        <Route path="/dmca-policy" element={<DMCA />} />
      </Routes>
    </Router>
  );
}

export default App;
