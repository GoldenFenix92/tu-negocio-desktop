import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Laptop } from 'lucide-react';
import './App.css';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Settings from './Settings';
import Products from './components/ProductManagement';
import Categories from './components/Categories';
import Clients from './components/Clients';
import SalesScreen from './components/SalesScreen';
import Reports from './components/Reports';
import UserProfile from './components/UserProfile';
import Coupons from './components/Coupons';

// Mock components for other routes
const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="dashboard-view">
      <h2>{t('menu.dashboard')}</h2>
      <p>{t('app.welcome')}</p>
    </div>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  console.log('App language:', i18n.language);

  // Apply theme class to body
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const appliedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    root.setAttribute('data-theme', appliedTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="main-content">
          <header className="app-header">
            <div className="header-left">
              <h1>{t('app.title')}</h1>
            </div>
            <div className="header-right">
              <div className="header-buttons">
                <button 
                  className={`icon-btn ${i18n.language?.startsWith('es') ? 'active' : ''}`}
                  onClick={() => {
                    i18n.changeLanguage('es');
                    localStorage.setItem('language', 'es');
                  }}
                  title="Español"
                >
                  ES
                </button>
                <button 
                  className={`icon-btn ${i18n.language?.startsWith('en') ? 'active' : ''}`}
                  onClick={() => {
                    i18n.changeLanguage('en');
                    localStorage.setItem('language', 'en');
                  }}
                  title="English"
                >
                  EN
                </button>
              </div>

              <div className="header-buttons">
                <button 
                  className={`icon-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  title="Light Mode"
                >
                  <Sun size={18} />
                </button>
                <button 
                  className={`icon-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  title="Dark Mode"
                >
                  <Moon size={18} />
                </button>
                <button 
                  className={`icon-btn ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                  title="System Theme"
                >
                  <Laptop size={18} />
                </button>
              </div>
            </div>
          </header>
          
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<SalesScreen />} />
              <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/clients" element={<Clients />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<UserProfile user={user} onUpdateUser={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
