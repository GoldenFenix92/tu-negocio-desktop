function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

const designs = [
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
    id: 'dark-default',
    name: 'Oscuro Verde',
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
    name: 'Oscuro Azul',
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
