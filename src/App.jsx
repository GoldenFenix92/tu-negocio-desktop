import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Laptop } from 'lucide-react';
import { ToastProvider } from './ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import SetupWizard from './components/SetupWizard';
import './App.css';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Settings from './Settings';
import Products from './components/ProductManagement';
import Categories from './components/Categories';
import Clients from './components/Clients';
import SalesScreen from './components/SalesScreen';
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports';
import UserProfile from './components/UserProfile';
import Coupons from './components/Coupons';

function loadFont(family) {
  const id = 'dynamic-google-font';
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function AppContent() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [businessConfig, setBusinessConfig] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const applyTypography = useCallback((family) => {
    if (!family) return;
    loadFont(family);
    document.documentElement.style.setProperty('--font-family', `'${family}', sans-serif`);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith('es') ? 'es' : 'en';
  }, [i18n.language]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const appliedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    root.setAttribute('data-theme', appliedTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const loadBusinessConfig = async () => {
    try {
      const data = await window.api.readConfig();
      if (data) {
        const parsed = JSON.parse(data);
        setBusinessConfig(parsed);
        applyTypography(parsed.typography);
      }
    } catch (e) {
      console.error('Failed to load business config', e);
    }
    setConfigLoaded(true);
  };

  useEffect(() => {
    loadBusinessConfig();
  }, []);

  useEffect(() => {
    window.api.onConfigChanged((config) => {
      setBusinessConfig(config);
      applyTypography(config.typography);
    });
  }, [applyTypography]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSetupComplete = (config) => {
    setBusinessConfig(config);
    applyTypography(config.typography);
  };

  const businessName = businessConfig?.businessName || t('app.title');
  const needsSetup = configLoaded && user && !businessConfig?.businessName;

  if (!user) {
    return <Login onLogin={handleLogin} businessName={businessName} />;
  }

  return (
    <Router>
      <div className="app-root">
        {needsSetup && <SetupWizard config={businessConfig} onComplete={handleSetupComplete} />}
        <TitleBar config={businessConfig} theme={theme} />
        <div className="app-layout">
          <Sidebar user={user} onLogout={handleLogout} />
          <div className="main-content">
            <header className="app-header">
              <div className="header-left">
                <h1>{businessName}</h1>
              </div>
              <div className="header-right">
                <div className="header-buttons">
                  <button
                    className={`icon-btn ${i18n.language?.startsWith('es') ? 'active' : ''}`}
                    onClick={() => { i18n.changeLanguage('es'); localStorage.setItem('language', 'es'); }}
                    title="Español"
                  >ES</button>
                  <button
                    className={`icon-btn ${i18n.language?.startsWith('en') ? 'active' : ''}`}
                    onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('language', 'en'); }}
                    title="English"
                  >EN</button>
                </div>
                <div className="header-buttons">
                  <button className={`icon-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')} title="Light Mode"><Sun size={18} /></button>
                  <button className={`icon-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')} title="Dark Mode"><Moon size={18} /></button>
                  <button className={`icon-btn ${theme === 'system' ? 'active' : ''}`}
                    onClick={() => setTheme('system')} title="System Theme"><Laptop size={18} /></button>
                </div>
              </div>
            </header>

            <main className="content-area">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor','Cashier']}><SalesScreen /></ProtectedRoute>} />
                <Route path="/sales-history" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><SalesHistory /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Products /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Categories /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor','Cashier']}><Clients /></ProtectedRoute>} />
                <Route path="/coupons" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Coupons /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['Administrator']}><Settings /></ProtectedRoute>} />
                <Route path="/profile" element={<UserProfile user={user} onUpdateUser={handleLogin} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
