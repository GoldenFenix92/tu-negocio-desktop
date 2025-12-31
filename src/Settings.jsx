import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Permissions from './components/Permissions';
import './Settings.css';

// Load existing config from a local JSON file (simplified)
const initialConfig = {
  businessName: '',
  logoPath: '',
  address: '',
  phone: '',
  typography: 'Roboto',
};

export default function Settings() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await window.api.readConfig();
        if (data) {
          setConfig(JSON.parse(data));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'business');
      if (savedPath) {
        setConfig((prev) => ({ ...prev, logoPath: savedPath }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await window.api.writeConfig(JSON.stringify(config));
    if (success) {
      alert(t('common.save_success') || 'Configuración guardada');
    } else {
      alert(t('common.save_error') || 'Error al guardar la configuración');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''} 
          onClick={() => setActiveTab('general')}
        >
          {t('menu.settings')}
        </button>
        <button 
          className={activeTab === 'permissions' ? 'active' : ''} 
          onClick={() => setActiveTab('permissions')}
        >
          {t('menu.permissions') || 'Permisos'}
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="settings-content">
          <h2>{t('settings.business_title') || 'Configuración del Negocio'}</h2>
          <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
              <label>{t('settings.business_name') || 'Nombre del negocio'}:</label>
              <input type="text" name="businessName" value={config.businessName} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>{t('settings.logo') || 'Logo'}:</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
              {config.logoPath && (
                <img 
                  src={config.logoPath.startsWith('media://') ? config.logoPath : `media://${config.logoPath}`} 
                  alt="Logo" 
                  className="logo-preview" 
                />
              )}
            </div>
            
            <div className="form-group">
              <label>{t('clients.address')}:</label>
              <input type="text" name="address" value={config.address} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>{t('clients.phone')}:</label>
              <input type="text" name="phone" value={config.phone} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>{t('settings.typography') || 'Tipografía'}:</label>
              <select name="typography" value={config.typography} onChange={handleChange}>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">{t('common.save')}</button>
          </form>
        </div>
      ) : (
        <Permissions />
      )}
    </div>
  );
}

