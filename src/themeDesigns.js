export const themeDesigns = {
  'light-default': {
    id: 'light-default',
    name: 'Claro Default',
    nameEn: 'Default Light',
    mode: 'light',
    colors: {
      primary: '#4f46e5',
      'bg-primary': '#ffffff',
      'bg-secondary': '#f8f9fa',
      'text-primary': '#2c3e50',
      'text-secondary': '#666666',
      'color-bg-light': '#fdfdfd',
      'color-bg-dark': '#0b1120',
      'color-text-light': '#2c3e50',
      'color-text-dark': '#e2e8f0',
    },
    gradient: '',
    antd: { colorPrimary: '#4f46e5', borderRadius: 10 },
  },
  'light-warm': {
    id: 'light-warm',
    name: 'Claro Cálido',
    nameEn: 'Warm Light',
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
    name: 'Oscuro Default',
    nameEn: 'Default Dark',
    mode: 'dark',
    colors: {
      primary: '#4f46e5',
      'bg-primary': '#0f172a',
      'bg-secondary': '#1e293b',
      'text-primary': '#e2e8f0',
      'text-secondary': '#94a3b8',
      'color-bg-light': '#fdfdfd',
      'color-bg-dark': '#0b1120',
      'color-text-light': '#2c3e50',
      'color-text-dark': '#e2e8f0',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(79, 70, 229, 0.06) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.04) 0%, transparent 60%)',
    antd: { colorPrimary: '#4f46e5', borderRadius: 10 },
  },
  'dark-midnight': {
    id: 'dark-midnight',
    name: 'Oscuro Medianoche',
    nameEn: 'Midnight Dark',
    mode: 'dark',
    colors: {
      primary: '#8b5cf6',
      'bg-primary': '#0a0a1a',
      'bg-secondary': '#1a1a2e',
      'text-primary': '#e0e0ff',
      'text-secondary': '#8888aa',
      'color-bg-light': '#fdfdfd',
      'color-bg-dark': '#0a0a1a',
      'color-text-light': '#2c3e50',
      'color-text-dark': '#e0e0ff',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(236, 72, 153, 0.04) 0%, transparent 60%)',
    antd: { colorPrimary: '#8b5cf6', borderRadius: 10 },
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
