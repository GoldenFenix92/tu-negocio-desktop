import React, { useState } from 'react';
import { LogIn, User, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Login.css';

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={40} color="var(--primary-color)" />
          </div>
          <h2>{t('login.title')}</h2>
          <p>{t('login.subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field">
            <User size={18} />
            <input 
              type="text" 
              placeholder={t('login.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <Lock size={18} />
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
        
        <div className="login-footer">
          <p>{t('login.footer')}</p>
        </div>
      </div>
    </div>
  );
}
