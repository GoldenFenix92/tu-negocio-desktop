import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastContext';
import { getMediaUrl } from './utils';
import Permissions from './components/Permissions';
import './Settings.css';

const initialConfig = {
  businessName: '',
  logoLightPath: '',
  logoDarkPath: '',
  hasThemeLogos: false,
  faviconPath: '',
  address: '',
  phone: '',
  typography: 'Roboto',
};

export default function Settings() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await window.api.readConfig();
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.logoPath && !parsed.logoLightPath) {
            parsed.logoLightPath = parsed.logoPath;
          }
          setConfig((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoUpload = (fieldName) => async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'business');
      if (savedPath) {
        setConfig((prev) => ({ ...prev, [fieldName]: savedPath }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await window.api.writeConfig(JSON.stringify(config));
    if (success) {
      showToast(t('common.saved'), 'success');
    } else {
      showToast(t('common.save_error') || 'Error al guardar la configuración', 'error');
    }
    setSaving(false);
  };

  const mediaSrc = (path) => path ? getMediaUrl(path) : null;

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
            <div className="form-group full">
              <label>{t('settings.business_name') || 'Nombre del negocio'}:</label>
              <input type="text" name="businessName" value={config.businessName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>{t('settings.logo') || 'Logo'}:</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload('logoLightPath')} />
              {config.logoLightPath && (
                <img src={mediaSrc(config.logoLightPath)} alt="Logo" className="logo-preview" />
              )}
            </div>

            <div className="form-group">
              <label>{t('settings.favicon') || 'Favicon'}:</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload('faviconPath')} />
              {config.faviconPath && (
                <img src={mediaSrc(config.faviconPath)} alt="Favicon" className="favicon-preview" />
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

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="hasThemeLogos" checked={config.hasThemeLogos} onChange={handleChange} />
                <span>{t('settings.has_theme_logos') || 'El logo tiene versión Light/Dark'}</span>
              </label>
            </div>

            {config.hasThemeLogos && (
              <div className="form-group full">
                <label>{t('settings.logo_dark') || 'Logo oscuro (Dark)'}:</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload('logoDarkPath')} />
                {config.logoDarkPath && (
                  <img src={mediaSrc(config.logoDarkPath)} alt="Logo Dark" className="logo-preview" />
                )}
              </div>
            )}

            <div className="form-group full">
              <label>{t('settings.typography') || 'Tipografía'}:</label>
              <select name="typography" value={config.typography} onChange={handleChange}>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</button>
          </form>
        </div>
      ) : (
        <Permissions />
      )}
    </div>
  );
}
