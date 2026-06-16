import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ConfigProvider, theme } from 'antd';
import { ToastProvider } from './ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import SetupWizard from './components/SetupWizard';
import { resolveDesign, applyDesignCSS, getDesign, applyInitialTheme } from './themeDesigns';
import { BusinessConfigContext, useBusinessConfigLoader } from './BusinessConfigContext';
import TitleBar from './components/TitleBar';
import './App.css';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
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

applyInitialTheme();

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
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'system');
  const [designId, setDesignId] = useState(localStorage.getItem('themeDesign') || 'light-default');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const { businessConfig, businessName, configLoaded, setBusinessConfig } = useBusinessConfigLoader();

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
    const appliedTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    root.setAttribute('data-theme', appliedTheme);
    root.classList.toggle('dark', appliedTheme === 'dark');
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  // Apply typography whenever businessConfig loads or changes
  useEffect(() => {
    if (businessConfig?.typography) {
      applyTypography(businessConfig.typography);
    }
  }, [businessConfig?.typography, applyTypography]);

  const design = useMemo(() => resolveDesign(themeMode, designId), [themeMode, designId]);
  const antdTheme = useMemo(() => ({
    algorithm: design.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: design.colors.primary,
      borderRadius: 10,
      fontSize: 14,
    },
    components: {
      Button: { controlHeight: 38 },
      Table: { headerBg: design.mode === 'dark' ? '#1f1f1f' : '#fafafa' },
    },
  }), [design]);

  useEffect(() => {
    applyDesignCSS(design);
    localStorage.setItem('themeDesign', designId);
  }, [design, designId]);

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
  };

  const handleLanguageToggle = () => {
    const next = i18n.language?.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  const needsSetup = configLoaded && user && !businessConfig?.businessName;

  const contextValue = useMemo(() => ({ businessConfig, businessName }), [businessConfig, businessName]);

  return (
    <BusinessConfigContext.Provider value={contextValue}>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ConfigProvider theme={antdTheme}>
          <Router>
            <div className="app-root">
              {needsSetup && <SetupWizard config={businessConfig} onComplete={handleSetupComplete} />}
              <div className="app-layout">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex flex-col flex-1 min-w-0">
                  <TitleBar
                    themeMode={themeMode}
                    onThemeChange={setThemeMode}
                    onLanguageToggle={handleLanguageToggle}
                    currentLang={i18n.language}
                  />
                  <main className="flex-1 overflow-auto bg-surface">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/sales" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor','Cashier']}><SalesScreen /></ProtectedRoute>} />
                      <Route path="/sales-history" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><SalesHistory /></ProtectedRoute>} />
                      <Route path="/products" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Products /></ProtectedRoute>} />
                      <Route path="/categories" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Categories /></ProtectedRoute>} />
                      <Route path="/clients" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor','Cashier']}><Clients /></ProtectedRoute>} />
                      <Route path="/coupons" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Coupons /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute allowedRoles={['Administrator','Supervisor']}><Reports /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute allowedRoles={['Administrator']}><Settings designId={designId} onDesignChange={setDesignId} /></ProtectedRoute>} />
                      <Route path="/profile" element={<UserProfile user={user} onUpdateUser={handleLogin} />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </div>
          </Router>
        </ConfigProvider>
      )}
    </BusinessConfigContext.Provider>
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
