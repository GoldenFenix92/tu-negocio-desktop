import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n.js';
import './App.css';

console.log('Starting index.js execution...');

function startApp() {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('No se encontró el elemento #root');
    }

    console.log('Mounting React App...');
    const root = ReactDOM.createRoot(container);
    root.render(
      <App />
    );
    console.log('React Render called.');
  } catch (err) {
    console.error('Fatal Initialization Error:', err);
    document.body.innerHTML = `
      <div style="padding: 20px; background: #c0392b; color: white;">
        <h1>Error Fatal al Iniciar la App</h1>
        <pre>${err.stack || err.message}</pre>
      </div>
    `;
  }
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
