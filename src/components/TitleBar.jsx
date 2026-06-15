import React from 'react';
import { getMediaUrl } from '../utils';

export default function TitleBar({ config, theme }) {
  const appliedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  const logoPath = config?.hasThemeLogos
    ? (appliedTheme === 'dark' ? config.logoDarkPath : config.logoLightPath)
    : config?.logoLightPath;

  const faviconSrc = config?.faviconPath ? getMediaUrl(config.faviconPath) : null;
  const logoSrc = logoPath ? getMediaUrl(logoPath) : null;

  return (
    <div className="titlebar">
      <div className="titlebar-drag">
        {faviconSrc && <img src={faviconSrc} alt="" className="titlebar-favicon" />}
        {logoSrc && <img src={logoSrc} alt="" className="titlebar-logo" />}
        <span className="titlebar-business-name">
          {config?.businessName || ''}
        </span>
      </div>
    </div>
  );
}
