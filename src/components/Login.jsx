import React, { useState } from 'react';
import { User, Lock, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Login.css';

export default function Login({ onLogin, businessName }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleExit = () => {
    window.api.quitApp();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const sql = 'SELECT * FROM users WHERE username = ?';
      const results = await window.api.dbQuery(sql, [username.toLowerCase()]);

      if (results.length === 0) {
        setError(t('login.error'));
        return;
      }

      const user = results[0];
      const isMatch = await window.api.comparePassword(password, user.password);

      if (isMatch) {
        onLogin({ 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          image_path: user.image_path 
        });
      } else {
        setError(t('login.error'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('common.save_error'));
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg" />
      <div className="login-container">
        <div className="login-card">
          <div className="login-card-inner">
            <div className="login-header">
              <div className="login-logo-ring">
                <div className="login-logo-icon">
                  <svg className="login-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
                  </svg>
                </div>
              </div>
              <h2 className="login-title">{businessName || t('app.title')}</h2>
              <p className="login-subtitle">{t('login.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-field">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder={t('login.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-field">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="login-button">
                {t('login.button')}
              </button>
            </form>

            <div className="login-divider" />

            <button type="button" className="exit-button" onClick={handleExit}>
              <LogOut size={16} /> {t('login.exit')}
            </button>

            <div className="login-footer">
              <p>{businessName ? `© ${new Date().getFullYear()} ${businessName}.` : t('login.footer')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
