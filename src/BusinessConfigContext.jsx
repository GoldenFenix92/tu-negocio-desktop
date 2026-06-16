import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BusinessConfigContext = createContext({ businessConfig: null, businessName: '' });

export function useBusinessConfig() {
  return useContext(BusinessConfigContext);
}

export { BusinessConfigContext };

export function useBusinessConfigLoader() {
  const [businessConfig, setBusinessConfig] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const data = await window.api.readConfig();
      if (data) {
        const parsed = JSON.parse(data);
        setBusinessConfig(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load business config', e);
    }
    return null;
  }, []);

  useEffect(() => {
    loadConfig().finally(() => setConfigLoaded(true));
  }, [loadConfig]);

  useEffect(() => {
    window.api.onConfigChanged((config) => {
      setBusinessConfig(config);
    });
  }, []);

  useEffect(() => {
    if (businessConfig?.businessName) {
      document.title = businessConfig.businessName;
    }
  }, [businessConfig]);

  useEffect(() => {
    const existing = document.querySelector('link[rel="icon"]');
    if (businessConfig?.faviconPath) {
      const href = `file:///${businessConfig.faviconPath.replace(/\\/g, '/')}`;
      if (existing) {
        existing.href = href;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = href;
        document.head.appendChild(link);
      }
    } else if (existing) {
      existing.remove();
    }
  }, [businessConfig?.faviconPath]);

  const businessName = businessConfig?.businessName || '';

  return { businessConfig, businessName, configLoaded, setBusinessConfig };
}
