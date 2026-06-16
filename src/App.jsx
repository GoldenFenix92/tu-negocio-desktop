import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Laptop } from 'lucide-react';
import { ConfigProvider, theme } from 'antd';
import { ToastProvider } from './ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import SetupWizard from './components/SetupWizard';
import { resolveDesign, applyDesignCSS, getDesign } from './themeDesigns';
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
    const appliedTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    root.setAttribute('data-theme', appliedTheme);
    root.classList.toggle('dark', appliedTheme === 'dark');
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const design = useMemo(() => resolveDesign(themeMode, designId), [themeMode, designId]);
  const antdTheme = useMemo(() => ({
    algorithm: design.mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: design.colors.primary,
      borderRadius: design.antd.borderRadius,
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

  const themeBtnClass = (mode) =>
    `p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      themeMode === mode
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
    }`;

  const langBtnClass = (lang) =>
    `p-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 ${
      i18n.language?.startsWith(lang)
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
    }`;

  return (
    <ConfigProvider theme={antdTheme}>
      <Router>
        <div className="app-root">
          {needsSetup && <SetupWizard config={businessConfig} onComplete={handleSetupComplete} />}
          <div className="app-layout">
            <Sidebar user={user} onLogout={handleLogout} />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="h-14 flex items-center justify-between px-6 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-700/50">
                <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {businessName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <button className={langBtnClass('es')}
                    onClick={() => { i18n.changeLanguage('es'); localStorage.setItem('language', 'es'); }}
                    title="Español">ES</button>
                  <button className={langBtnClass('en')}
                    onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('language', 'en'); }}
                    title="English">EN</button>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button className={themeBtnClass('light')}
                    onClick={() => setThemeMode('light')} title="Light Mode"><Sun size={16} /></button>
                  <button className={themeBtnClass('dark')}
                    onClick={() => setThemeMode('dark')} title="Dark Mode"><Moon size={16} /></button>
                  <button className={themeBtnClass('system')}
                    onClick={() => setThemeMode('system')} title="System Theme"><Laptop size={16} /></button>
                </div>
              </header>
              <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
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
