export const themeDesigns = {
  'light-default': {
    id: 'light-default',
    name: 'Claro Azul',
    nameEn: 'Blue Light',
    mode: 'light',
    colors: {
      primary: '#2563eb',
      'bg-primary': '#ffffff',
      'bg-secondary': '#f1f5f9',
      'text-primary': '#1e293b',
      'text-secondary': '#64748b',
      'color-bg-light': '#f8fafc',
      'color-bg-dark': '#0b1120',
      'color-text-light': '#1e293b',
      'color-text-dark': '#e2e8f0',
    },
    gradient: '',
    antd: { colorPrimary: '#2563eb', borderRadius: 10 },
  },
  'light-warm': {
    id: 'light-warm',
    name: 'Claro Dorado',
    nameEn: 'Gold Light',
    mode: 'light',
    colors: {
      primary: '#d97706',
      'bg-primary': '#fefcf7',
      'bg-secondary': '#f5f0eb',
      'text-primary': '#3d2e1e',
      'text-secondary': '#7a6b5b',
      'color-bg-light': '#fefcf7',
      'color-bg-dark': '#0b1120',
      'color-text-light': '#3d2e1e',
      'color-text-dark': '#e2e8f0',
    },
    gradient: '',
    antd: { colorPrimary: '#d97706', borderRadius: 10 },
  },
  'dark-default': {
    id: 'dark-default',
    name: 'Oscuro Verde',
    nameEn: 'Forest Dark',
    mode: 'dark',
    colors: {
      primary: '#22c55e',
      'bg-primary': '#0a1a0f',
      'bg-secondary': '#14281a',
      'text-primary': '#dcfce7',
      'text-secondary': '#86efac',
      'color-bg-light': '#f8fafc',
      'color-bg-dark': '#0a1a0f',
      'color-text-light': '#1e293b',
      'color-text-dark': '#dcfce7',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(34, 197, 94, 0.07) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(20, 83, 45, 0.05) 0%, transparent 60%)',
    antd: { colorPrimary: '#22c55e', borderRadius: 10 },
  },
  'dark-midnight': {
    id: 'dark-midnight',
    name: 'Oscuro Azul',
    nameEn: 'Ocean Dark',
    mode: 'dark',
    colors: {
      primary: '#0ea5e9',
      'bg-primary': '#0a0f1a',
      'bg-secondary': '#141e2e',
      'text-primary': '#e0f2fe',
      'text-secondary': '#7dd3fc',
      'color-bg-light': '#f8fafc',
      'color-bg-dark': '#0a0f1a',
      'color-text-light': '#1e293b',
      'color-text-dark': '#e0f2fe',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.07) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.04) 0%, transparent 60%)',
    antd: { colorPrimary: '#0ea5e9', borderRadius: 10 },
  },
};

export function getDesign(designId) {
  return themeDesigns[designId] || themeDesigns['light-default'];
}

export function resolveDesign(themeMode, designId) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
  const design = getDesign(designId);
  if (design.mode === resolvedTheme) return design;
  return Object.values(themeDesigns).find(d => d.mode === resolvedTheme);
}

export function getDesignsForMode(mode) {
  return Object.values(themeDesigns).filter(d => d.mode === mode);
}

export function applyDesignCSS(design) {
  const root = document.documentElement;
  const { colors, gradient } = design;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  if (gradient) {
    root.style.setProperty('--bg-gradient', gradient);
  } else {
    root.style.removeProperty('--bg-gradient');
  }
}
