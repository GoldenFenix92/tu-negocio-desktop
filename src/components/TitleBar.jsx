import React from 'react';
import { Moon, Sun, Laptop, Languages, Minus, Square } from 'lucide-react';
import { useBusinessConfig } from '../BusinessConfigContext';
import { getMediaUrl } from '../utils';
import './TitleBar.css';

const pillActive = 'bg-primary/10 text-primary';
const pillInactive = 'text-on-surface-secondary hover:bg-surface-secondary';

export default function TitleBar({ themeMode, onThemeChange, onLanguageToggle, currentLang }) {
  const { businessConfig, businessName } = useBusinessConfig();

  const appliedTheme = themeMode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : themeMode;

  const logoPath = businessConfig?.hasThemeLogos
    ? (appliedTheme === 'dark' ? businessConfig.logoDarkPath : businessConfig.logoLightPath)
    : businessConfig?.logoLightPath;

  const faviconSrc = businessConfig?.faviconPath ? getMediaUrl(businessConfig.faviconPath) : null;
  const logoSrc = logoPath ? getMediaUrl(logoPath) : null;

  const themeBtnClass = (mode) =>
    `p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      themeMode === mode ? pillActive : pillInactive
    }`;

  return (
    <header className="titlebar">
      <div className="titlebar-drag">
        {faviconSrc && (
          <img src={faviconSrc} alt="" className="titlebar-favicon" />
        )}
        {logoSrc ? (
          <img src={logoSrc} alt={businessName} className="titlebar-logo" />
        ) : (
          <div className="titlebar-logo-fallback">
            {(businessName || 'TN').slice(0, 2).toUpperCase()}
          </div>
        )}
        <span className="titlebar-business-name">{businessName}</span>
      </div>

      <div className="titlebar-controls" style={{ WebkitAppRegion: 'no-drag' }}>
        <button className={pillInactive} onClick={onLanguageToggle}
          title={currentLang?.startsWith('es') ? 'English' : 'Español'}>
          <Languages size={16} />
          <span className="text-xs font-bold tracking-wide ml-1">
            {currentLang?.startsWith('es') ? 'EN' : 'ES'}
          </span>
        </button>

        <div className="w-px h-5 bg-on-surface-secondary/20 mx-1" />

        <button className={themeBtnClass('light')}
          onClick={() => onThemeChange('light')} title="Light Mode">
          <Sun size={16} />
        </button>
        <button className={themeBtnClass('dark')}
          onClick={() => onThemeChange('dark')} title="Dark Mode">
          <Moon size={16} />
        </button>
        <button className={themeBtnClass('system')}
          onClick={() => onThemeChange('system')} title="System Theme">
          <Laptop size={16} />
        </button>

        <div className="w-px h-5 bg-on-surface-secondary/20 mx-1" />

        <button className="win-btn" onClick={() => window.api.minimizeApp?.()} title="Minimize">
          <Minus size={14} />
        </button>
        <button className="win-btn" onClick={() => window.api.maximizeApp?.()} title="Maximize">
          <Square size={12} />
        </button>
      </div>
    </header>
  );
}
