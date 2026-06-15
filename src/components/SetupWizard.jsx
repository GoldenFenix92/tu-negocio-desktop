import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import { getMediaUrl } from '../utils';
import './SetupWizard.css';

export default function SetupWizard({ config, onComplete }) {
  const { t } = useTranslation();
  const showToast = useToast();
  const [form, setForm] = useState({
    businessName: config?.businessName || '',
    logoLightPath: config?.logoLightPath || '',
    logoDarkPath: config?.logoDarkPath || '',
    hasThemeLogos: config?.hasThemeLogos || false,
    faviconPath: config?.faviconPath || '',
    address: config?.address || '',
    phone: config?.phone || '',
    typography: config?.typography || 'Roboto',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoUpload = (fieldName) => async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'business');
      if (savedPath) {
        setForm(prev => ({ ...prev, [fieldName]: savedPath }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    setSaving(true);
    const success = await window.api.writeConfig(JSON.stringify(form));
    if (success) {
      showToast(t('common.saved'), 'success');
      onComplete(form);
    } else {
      showToast(t('common.save_error'), 'error');
    }
    setSaving(false);
  };

  return (
    <div className="setup-overlay">
      <div className="setup-card">
        <h2>{t('setup.title')}</h2>
        <p className="setup-subtitle">{t('setup.subtitle')}</p>
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-row">
            <div className="setup-field">
              <label>{t('settings.business_name')}</label>
              <input type="text" name="businessName" value={form.businessName} onChange={handleChange} required autoFocus placeholder={t('setup.name_placeholder')} />
            </div>
            <div className="setup-field">
              <label>{t('settings.typography')}</label>
              <select name="typography" value={form.typography} onChange={handleChange}>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Outfit">Outfit</option>
              </select>
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-field">
              <label>{t('settings.logo')}</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload('logoLightPath')} />
              {form.logoLightPath && <img src={getMediaUrl(form.logoLightPath)} alt="" className="setup-logo-preview" />}
            </div>
            <div className="setup-field">
              <label>{t('settings.favicon')}</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload('faviconPath')} />
              {form.faviconPath && <img src={getMediaUrl(form.faviconPath)} alt="" className="setup-favicon-preview" />}
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-field">
              <label>{t('clients.address')}</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="setup-field">
              <label>{t('clients.phone')}</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <label className="setup-checkbox">
            <input type="checkbox" name="hasThemeLogos" checked={form.hasThemeLogos} onChange={handleChange} />
            <span>{t('settings.has_theme_logos')}</span>
          </label>

          {form.hasThemeLogos && (
            <div className="setup-row">
              <div className="setup-field">
                <label>{t('settings.logo_dark')}</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload('logoDarkPath')} />
                {form.logoDarkPath && <img src={getMediaUrl(form.logoDarkPath)} alt="" className="setup-logo-preview" />}
              </div>
            </div>
          )}

          <button type="submit" className="setup-submit" disabled={saving || !form.businessName.trim()}>
            {saving ? t('common.loading') : t('setup.start')}
          </button>
        </form>
      </div>
    </div>
  );
}
