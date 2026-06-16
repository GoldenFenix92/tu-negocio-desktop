function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

const designs = [
  // ─── Light ────────────────────────────────────────────────
  {
    id: 'light-default',
    name: 'Claro Azul',
    nameEn: 'Blue Light',
    mode: 'light',
    colors: {
      primary: '#2563eb',
      surface: '#ffffff',
      'surface-secondary': '#f1f5f9',
      'on-surface': '#1e293b',
      'on-surface-secondary': '#64748b',
    },
    gradient: '',
  },
  {
    id: 'light-warm',
    name: 'Claro Dorado',
    nameEn: 'Gold Light',
    mode: 'light',
    colors: {
      primary: '#d97706',
      surface: '#fefcf7',
      'surface-secondary': '#f5f0eb',
      'on-surface': '#3d2e1e',
      'on-surface-secondary': '#7a6b5b',
    },
    gradient: '',
  },
  {
    id: 'light-rose',
    name: 'Rosa Vibrante',
    nameEn: 'Rose Light',
    mode: 'light',
    colors: {
      primary: '#e11d48',
      surface: '#ffffff',
      'surface-secondary': '#fce7f3',
      'on-surface': '#1e293b',
      'on-surface-secondary': '#64748b',
    },
    gradient: '',
  },
  {
    id: 'light-slate',
    name: 'Pizarra Teal',
    nameEn: 'Slate Teal',
    mode: 'light',
    colors: {
      primary: '#0f766e',
      surface: '#f8fafc',
      'surface-secondary': '#e2e8f0',
      'on-surface': '#0c0a09',
      'on-surface-secondary': '#57534e',
    },
    gradient: '',
  },
  {
    id: 'light-lavender',
    name: 'Lavanda',
    nameEn: 'Lavender Light',
    mode: 'light',
    colors: {
      primary: '#7c3aed',
      surface: '#ffffff',
      'surface-secondary': '#f3e8ff',
      'on-surface': '#1e1b4b',
      'on-surface-secondary': '#6b7280',
    },
    gradient: '',
  },

  // ─── Dark ─────────────────────────────────────────────────
  {
    id: 'dark-default',
    name: 'Oscuro Bosque',
    nameEn: 'Forest Dark',
    mode: 'dark',
    colors: {
      primary: '#22c55e',
      surface: '#0a1a0f',
      'surface-secondary': '#14281a',
      'on-surface': '#dcfce7',
      'on-surface-secondary': '#86efac',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(34,197,94,0.07) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(20,83,45,0.05) 0%, transparent 60%)',
  },
  {
    id: 'dark-midnight',
    name: 'Oscuro Océano',
    nameEn: 'Ocean Dark',
    mode: 'dark',
    colors: {
      primary: '#0ea5e9',
      surface: '#0a0f1a',
      'surface-secondary': '#141e2e',
      'on-surface': '#e0f2fe',
      'on-surface-secondary': '#7dd3fc',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(14,165,233,0.07) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(56,189,248,0.04) 0%, transparent 60%)',
  },
  {
    id: 'dark-cyberpunk',
    name: 'Cyberpunk Neón',
    nameEn: 'Cyberpunk Dark',
    mode: 'dark',
    colors: {
      primary: '#f43f5e',
      surface: '#0a0015',
      'surface-secondary': '#1c0030',
      'on-surface': '#fce7f3',
      'on-surface-secondary': '#f9a8d4',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(244,63,94,0.1) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6,182,212,0.06) 0%, transparent 60%)',
  },
  {
    id: 'dark-matrix',
    name: 'Matrix Esmeralda',
    nameEn: 'Matrix Emerald',
    mode: 'dark',
    colors: {
      primary: '#10b981',
      surface: '#020202',
      'surface-secondary': '#0a1a0f',
      'on-surface': '#d1fae5',
      'on-surface-secondary': '#6ee7b7',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.08) 0%, transparent 60%)',
  },
  {
    id: 'dark-ember',
    name: 'Oscuro Ámbar',
    nameEn: 'Ember Dark',
    mode: 'dark',
    colors: {
      primary: '#f97316',
      surface: '#0f0b08',
      'surface-secondary': '#1c1510',
      'on-surface': '#fff7ed',
      'on-surface-secondary': '#fdba74',
    },
    gradient: 'radial-gradient(ellipse at top right, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(239,68,68,0.04) 0%, transparent 60%)',
  },
];

const BY_ID = Object.fromEntries(designs.map(d => [d.id, d]));

export const themeDesigns = BY_ID;

export function getDesign(designId) {
  return BY_ID[designId] || designs[0];
}

export function resolveDesign(themeMode, designId) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
  const design = getDesign(designId);
  if (design.mode === resolvedTheme) return design;
  return designs.find(d => d.mode === resolvedTheme);
}

export function getDesignsForMode(mode) {
  return designs.filter(d => d.mode === mode);
}

export function applyDesignCSS(design) {
  const root = document.documentElement;
  const { colors, gradient } = design;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
    const rgb = hexToRgb(value);
    root.style.setProperty(`--color-${key}-rgb`, rgb);
  });

  if (gradient) {
    root.style.setProperty('--bg-gradient', gradient);
  } else {
    root.style.removeProperty('--bg-gradient');
  }

  root.style.setProperty('--primary-color', colors.primary);
  root.style.setProperty('--bg-primary', colors.surface);
  root.style.setProperty('--bg-secondary', colors['surface-secondary']);
  root.style.setProperty('--text-primary', colors['on-surface']);
  root.style.setProperty('--text-secondary', colors['on-surface-secondary']);
  root.style.setProperty('--color-bg-light', colors.surface);
  root.style.setProperty('--color-bg-dark', colors.surface);
  root.style.setProperty('--color-text-light', colors['on-surface']);
  root.style.setProperty('--color-text-dark', colors['on-surface']);
}

export function applyInitialTheme() {
  const savedDesignId = localStorage.getItem('themeDesign') || 'light-default';
  const savedThemeMode = localStorage.getItem('theme') || 'system';
  const design = resolveDesign(savedThemeMode, savedDesignId);
  applyDesignCSS(design);

  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const appliedTheme = savedThemeMode === 'system' ? (prefersDark ? 'dark' : 'light') : savedThemeMode;
  root.setAttribute('data-theme', appliedTheme);
  root.classList.toggle('dark', appliedTheme === 'dark');
}
