/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import BusinessProfile from './pages/BusinessProfile';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RestaurantDashboard from './pages/Dashboard/RestaurantDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="discover" element={<Discover />} />
                <Route path="business/:id" element={<BusinessProfile />} />
                <Route path="login" element={<Login />} />
                <Route path="profile" element={<Profile />} />
                <Route path="restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="admin-dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

