import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastContext';
import { getMediaUrl } from './utils';
import { themeDesigns, getDesignsForMode } from './themeDesigns';
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

export default function Settings({ designId, onDesignChange }) {
  const { t, i18n } = useTranslation();
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

  const handleDesignSelect = (id) => {
    onDesignChange(id);
    showToast(t('settings.theme_applied'), 'success');
  };

  const mediaSrc = (path) => path ? getMediaUrl(path) : null;
  const isES = i18n.language?.startsWith('es');
  const lightDesigns = getDesignsForMode('light');
  const darkDesigns = getDesignsForMode('dark');

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
          className={activeTab === 'theme' ? 'active' : ''}
          onClick={() => setActiveTab('theme')}
        >
          {t('settings.themes') || 'Temas'}
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
      ) : activeTab === 'theme' ? (
        <div className="settings-content">
          <h2>{t('settings.themes') || 'Temas y Diseños'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {t('settings.theme_subtitle') || 'Selecciona el diseño visual que prefieras para cada modo'}
          </p>

          <div className="mb-8">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              {t('settings.light_designs') || 'Modo Claro'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lightDesigns.map((d) => (
                <DesignCard
                  key={d.id}
                  design={d}
                  isSelected={designId === d.id}
                  onSelect={handleDesignSelect}
                  isES={isES}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400" />
              {t('settings.dark_designs') || 'Modo Oscuro'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {darkDesigns.map((d) => (
                <DesignCard
                  key={d.id}
                  design={d}
                  isSelected={designId === d.id}
                  onSelect={handleDesignSelect}
                  isES={isES}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Permissions />
      )}
    </div>
  );
}

function DesignCard({ design, isSelected, onSelect, isES }) {
  const { colors } = design;
  const label = isES ? design.name : (design.nameEn || design.name);

  return (
    <button
      onClick={() => onSelect(design.id)}
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md'
      }`}
      style={{ background: colors['bg-primary'], color: colors['text-primary'] }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
            style={{ background: colors.primary }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{label}</p>
            <p className="text-xs opacity-60" style={{ color: colors['text-secondary'] }}>
              {design.mode === 'light' ? 'Light' : 'Dark'} · {colors.primary}
            </p>
          </div>
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded-lg flex items-center px-3 text-xs font-medium"
            style={{ background: colors['bg-secondary'], color: colors['text-secondary'] }}>
            <span className="truncate">{colors['text-secondary']}</span>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: colors.primary, color: '#fff' }}>
            {colors.primary === '#2563eb' ? 'BL' : colors.primary === '#d97706' ? 'GO' : colors.primary === '#22c55e' ? 'GR' : 'OC'}
          </div>
        </div>
      </div>
      {design.gradient && (
        <div className="h-6" style={{ background: design.gradient, opacity: 0.15 }} />
      )}
    </button>
  );
}
