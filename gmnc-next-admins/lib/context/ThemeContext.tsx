'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePreset = 'emerald' | 'blue' | 'purple' | 'rose' | 'amber' | 'slate' | 'cyan' | 'fuchsia' | 'green' | 'indigo' | 'lime' | 'orange' | 'pink' | 'red' | 'sky' | 'teal' | 'violet' | 'yellow';

export type FontFamily = 'geist' | 'inter' | 'roboto' | 'open-sans' | 'lato';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type BorderRadius = 'default' | 'small' | 'large' | 'full';

export type BaseColor = 'neutral' | 'stone' | 'zinc' | 'mauve' | 'olive' | 'mist' | 'taupe';

export type ChartColor = 'amber' | 'blue' | 'cyan' | 'emerald' | 'fuchsia' | 'green' | 'indigo' | 'lime' | 'orange' | 'pink' | 'purple' | 'red' | 'rose' | 'sky' | 'teal' | 'violet' | 'yellow';

export type StylePreset = 'default' | 'compact' | 'spacious' | 'sharp' | 'dense';

export interface AppearancePreferences {
  themeMode: ThemeMode;
  colorPreset: ThemePreset;
  fontFamily: FontFamily;
  fontSize: FontSize;
  borderRadius: BorderRadius;
  baseColor: BaseColor;
  chartColor: ChartColor;
  stylePreset: StylePreset;
}

export interface ThemeContextValue {
  preferences: AppearancePreferences;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setColorPreset: (preset: ThemePreset) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setBorderRadius: (radius: BorderRadius) => void;
  setBaseColor: (color: BaseColor) => void;
  setChartColor: (color: ChartColor) => void;
  setStylePreset: (style: StylePreset) => void;
  updatePreferences: (prefs: Partial<AppearancePreferences>) => void;
  savePreferences: () => Promise<boolean>;
  isLoading: boolean;
}

// ── Color Presets ──────────────────────────────────────────────────────

export const COLOR_PRESETS: Record<ThemePreset, { name: string; primary: string; brand: string; accent: string; lightBg: string; darkBg: string; darkCard: string; darkText: string; darkMuted: string }> = {
  emerald: {
    name: 'Emerald',
    primary: '#064E3B',
    brand: '#059669',
    accent: '#F59E0B',
    lightBg: '#F8FAFC',
    darkBg: '#0F172A',
    darkCard: '#1E293B',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#1E3A5F',
    brand: '#3B82F6',
    accent: '#F59E0B',
    lightBg: '#F0F4FF',
    darkBg: '#0B1120',
    darkCard: '#1A2744',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#4C1D95',
    brand: '#7C3AED',
    accent: '#F59E0B',
    lightBg: '#F5F3FF',
    darkBg: '#0F0A1A',
    darkCard: '#1E1533',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  rose: {
    name: 'Rose',
    primary: '#881337',
    brand: '#E11D48',
    accent: '#F59E0B',
    lightBg: '#FFF1F2',
    darkBg: '#1A0A0E',
    darkCard: '#2D1519',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  amber: {
    name: 'Amber',
    primary: '#78350F',
    brand: '#D97706',
    accent: '#059669',
    lightBg: '#FFFBEB',
    darkBg: '#1A1205',
    darkCard: '#2D2008',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  slate: {
    name: 'Slate',
    primary: '#1E293B',
    brand: '#475569',
    accent: '#059669',
    lightBg: '#F8FAFC',
    darkBg: '#0F172A',
    darkCard: '#1E293B',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  cyan: {
    name: 'Cyan',
    primary: '#164E63',
    brand: '#06B6D4',
    accent: '#F59E0B',
    lightBg: '#ECFEFF',
    darkBg: '#0B1120',
    darkCard: '#14334D',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  fuchsia: {
    name: 'Fuchsia',
    primary: '#701A75',
    brand: '#D946EF',
    accent: '#F59E0B',
    lightBg: '#FDF4FF',
    darkBg: '#150E1A',
    darkCard: '#291624',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  green: {
    name: 'Green',
    primary: '#14532D',
    brand: '#22C55E',
    accent: '#F59E0B',
    lightBg: '#F0FDF4',
    darkBg: '#071D10',
    darkCard: '#132B1E',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  indigo: {
    name: 'Indigo',
    primary: '#312E81',
    brand: '#6366F1',
    accent: '#F59E0B',
    lightBg: '#EEF2FF',
    darkBg: '#0F0B24',
    darkCard: '#1E1A3A',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  lime: {
    name: 'Lime',
    primary: '#1A2E05',
    brand: '#84CC16',
    accent: '#F59E0B',
    lightBg: '#F7FEE7',
    darkBg: '#141E0A',
    darkCard: '#243513',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  orange: {
    name: 'Orange',
    primary: '#7C2D12',
    brand: '#F97316',
    accent: '#F59E0B',
    lightBg: '#FFF7ED',
    darkBg: '#1F110A',
    darkCard: '#331D0F',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  pink: {
    name: 'Pink',
    primary: '#831843',
    brand: '#EC4899',
    accent: '#F59E0B',
    lightBg: '#FDF2F8',
    darkBg: '#200C16',
    darkCard: '#361424',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  red: {
    name: 'Red',
    primary: '#7F1D1D',
    brand: '#EF4444',
    accent: '#F59E0B',
    lightBg: '#FEF2F2',
    darkBg: '#1F0C0C',
    darkCard: '#331414',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  sky: {
    name: 'Sky',
    primary: '#0C4A6E',
    brand: '#0EA5E9',
    accent: '#F59E0B',
    lightBg: '#F0F9FF',
    darkBg: '#091E2B',
    darkCard: '#132E41',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  teal: {
    name: 'Teal',
    primary: '#134E4A',
    brand: '#14B8A6',
    accent: '#F59E0B',
    lightBg: '#F0FDFA',
    darkBg: '#0A1D1B',
    darkCard: '#132E2B',
    darkText: '#F1F5F9',
    darkMuted: '#94A3B8',
  },
  violet: {
    name: 'Violet',
    primary: '#4C1D95',
    brand: '#8B5CF6',
    accent: '#F59E0B',
    lightBg: '#F5F3FF',
    darkBg: '#140F22',
    darkCard: '#271D3D',
    darkText: '#E2E8F0',
    darkMuted: '#94A3B8',
  },
  yellow: {
    name: 'Yellow',
    primary: '#713F12',
    brand: '#EAB308',
    accent: '#F59E0B',
    lightBg: '#FEFCE8',
    darkBg: '#1E1A08',
    darkCard: '#332D14',
    darkText: '#FEF9C3',
    darkMuted: '#D6D3D1',
  },
};

// ── Font Sizes ─────────────────────────────────────────────────────────

export const FONT_SIZES: Record<FontSize, { name: string; base: string; small: string; large: string; heading: string }> = {
  small: { name: 'Small', base: '13px', small: '11px', large: '15px', heading: '20px' },
  medium: { name: 'Medium', base: '14px', small: '12px', large: '16px', heading: '24px' },
  large: { name: 'Large', base: '16px', small: '13px', large: '18px', heading: '28px' },
  xlarge: { name: 'Extra Large', base: '18px', small: '14px', large: '20px', heading: '32px' },
};

// ── Font Families ──────────────────────────────────────────────────────

export const FONT_FAMILIES: Record<FontFamily, { name: string; css: string }> = {
  geist: { name: 'Geist', css: 'var(--font-geist-sans), system-ui, sans-serif' },
  inter: { name: 'Inter', css: 'Inter, system-ui, sans-serif' },
  roboto: { name: 'Roboto', css: 'Roboto, system-ui, sans-serif' },
  'open-sans': { name: 'Open Sans', css: 'Open Sans, system-ui, sans-serif' },
  lato: { name: 'Lato', css: 'Lato, system-ui, sans-serif' },
};

// ── Border Radius Options ──────────────────────────────────────────────

export const BORDER_RADIUS: Record<BorderRadius, { name: string; css: string }> = {
  default: { name: 'Default', css: '0.5rem' },
  small: { name: 'Small', css: '0.375rem' },
  large: { name: 'Large', css: '0.75rem' },
  full: { name: 'Full', css: '1rem' },
};

// ── Base Colors ────────────────────────────────────────────────────────

export const BASE_COLORS: Record<BaseColor, { name: string; color: string; darkBg: string; darkCard: string; darkText: string; darkMuted: string }> = {
  neutral: { name: 'Neutral', color: '#71717a', darkBg: '#0F172A', darkCard: '#1E293B', darkText: '#F1F5F9', darkMuted: '#94A3B8' },
  stone: { name: 'Stone', color: '#78716c', darkBg: '#1C1917', darkCard: '#292524', darkText: '#F5F5F4', darkMuted: '#A8A29E' },
  zinc: { name: 'Zinc', color: '#71717a', darkBg: '#09090B', darkCard: '#18181B', darkText: '#FAFAFA', darkMuted: '#A1A1AA' },
  mauve: { name: 'Mauve', color: '#a1a1aa', darkBg: '#110F14', darkCard: '#1F1D24', darkText: '#F4F4F5', darkMuted: '#A1A1AA' },
  olive: { name: 'Olive', color: '#84cc16', darkBg: '#0F1205', darkCard: '#1C2108', darkText: '#F4F4F0', darkMuted: '#A3A380' },
  mist: { name: 'Mist', color: '#94a3b8', darkBg: '#0F1520', darkCard: '#1B2535', darkText: '#F1F5F9', darkMuted: '#94A3B8' },
  taupe: { name: 'Taupe', color: '#a8a29e', darkBg: '#181615', darkCard: '#272423', darkText: '#F5F5F4', darkMuted: '#A8A29E' },
};

// ── Chart Colors ───────────────────────────────────────────────────────

export const CHART_COLORS: Record<ChartColor, { name: string; color: string }> = {
  amber: { name: 'Amber', color: '#F59E0B' },
  blue: { name: 'Blue', color: '#3B82F6' },
  cyan: { name: 'Cyan', color: '#06B6D4' },
  emerald: { name: 'Emerald', color: '#059669' },
  fuchsia: { name: 'Fuchsia', color: '#D946EF' },
  green: { name: 'Green', color: '#22C55E' },
  indigo: { name: 'Indigo', color: '#6366F1' },
  lime: { name: 'Lime', color: '#84CC16' },
  orange: { name: 'Orange', color: '#F97316' },
  pink: { name: 'Pink', color: '#EC4899' },
  purple: { name: 'Purple', color: '#A855F7' },
  red: { name: 'Red', color: '#EF4444' },
  rose: { name: 'Rose', color: '#F43F5E' },
  sky: { name: 'Sky', color: '#0EA5E9' },
  teal: { name: 'Teal', color: '#14B8A6' },
  violet: { name: 'Violet', color: '#8B5CF6' },
  yellow: { name: 'Yellow', color: '#EAB308' },
};

// ── Style Presets ──────────────────────────────────────────────────────

export const STYLE_PRESETS: Record<StylePreset, { name: string; description: string }> = {
  default: { name: 'Vega', description: 'The classic shadow look.' },
  compact: { name: 'Nova', description: 'Reduced spacing for compact layouts.' },
  spacious: { name: 'Maia', description: 'Soft and rounded with generous spacing.' },
  sharp: { name: 'Lyra', description: 'Boxy and sharp for structured surfaces.' },
  dense: { name: 'Mira', description: 'Dense UI tuned for data-heavy screens.' },
};

// ── Theme Color Options (for theme color picker) ───────────────────────

export const THEME_COLOR_OPTIONS: { id: string; name: string; color: string; preset: ThemePreset | null }[] = [
  { id: 'amber', name: 'Amber', color: '#F59E0B', preset: 'amber' },
  { id: 'blue', name: 'Blue', color: '#3B82F6', preset: 'blue' },
  { id: 'cyan', name: 'Cyan', color: '#06B6D4', preset: 'cyan' },
  { id: 'emerald', name: 'Emerald', color: '#059669', preset: 'emerald' },
  { id: 'fuchsia', name: 'Fuchsia', color: '#D946EF', preset: 'fuchsia' },
  { id: 'green', name: 'Green', color: '#22C55E', preset: 'green' },
  { id: 'indigo', name: 'Indigo', color: '#6366F1', preset: 'indigo' },
  { id: 'lime', name: 'Lime', color: '#84CC16', preset: 'lime' },
  { id: 'orange', name: 'Orange', color: '#F97316', preset: 'orange' },
  { id: 'pink', name: 'Pink', color: '#EC4899', preset: 'pink' },
  { id: 'purple', name: 'Purple', color: '#A855F7', preset: 'purple' },
  { id: 'red', name: 'Red', color: '#EF4444', preset: 'red' },
  { id: 'rose', name: 'Rose', color: '#F43F5E', preset: 'rose' },
  { id: 'sky', name: 'Sky', color: '#0EA5E9', preset: 'sky' },
  { id: 'teal', name: 'Teal', color: '#14B8A6', preset: 'teal' },
  { id: 'violet', name: 'Violet', color: '#8B5CF6', preset: 'violet' },
  { id: 'yellow', name: 'Yellow', color: '#EAB308', preset: 'yellow' },
];

// ── Defaults ───────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: AppearancePreferences = {
  themeMode: 'light',
  colorPreset: 'amber',
  fontFamily: 'roboto',
  fontSize: 'medium',
  borderRadius: 'default',
  baseColor: 'neutral',
  chartColor: 'blue',
  stylePreset: 'default',
};

// ── Storage helpers ────────────────────────────────────────────────────

function getStorageKey(userId?: string | null): string {
  return userId ? `gmnc_theme_${userId}` : 'gmnc_theme_default';
}

function loadPreferences(userId?: string | null): AppearancePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCES;
}

function savePreferencesToStorage(userId: string | null, prefs: AppearancePreferences) {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// ── Context ────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, userId }: { children: React.ReactNode; userId?: string | null }) {
  // Load from localStorage synchronously to prevent theme flash on login page
  const initialPrefs = typeof window !== 'undefined'
    ? loadPreferences(userId)
    : DEFAULT_PREFERENCES;
  const initialDark = initialPrefs.themeMode === 'dark' || (
    initialPrefs.themeMode === 'system' && typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [preferences, setPreferences] = useState<AppearancePreferences>(initialPrefs);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(initialDark);
  const prevUserIdRef = useRef<string | null>(null);
  const systemMqRef = useRef<MediaQueryList | null>(null);

  // Load preferences when userId changes
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = loadPreferences(userId);
      setPreferences(stored);
      setIsLoading(false);
      prevUserIdRef.current = userId ?? null;
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [userId]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const preset = COLOR_PRESETS[preferences.colorPreset] || COLOR_PRESETS.emerald;
    const baseColor = BASE_COLORS[preferences.baseColor] || BASE_COLORS.neutral;
    const fontSize = FONT_SIZES[preferences.fontSize] || FONT_SIZES.medium;
    const fontFamily = FONT_FAMILIES[preferences.fontFamily] || FONT_FAMILIES.geist;
    const borderRadius = BORDER_RADIUS[preferences.borderRadius] || BORDER_RADIUS.default;

    // Determine if dark mode
    let dark = false;
    if (preferences.themeMode === 'dark') {
      dark = true;
    } else if (preferences.themeMode === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    const darkTimeout = window.setTimeout(() => setIsDark(dark), 0);

    // Apply dark class
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set data attributes
    root.setAttribute('data-color', preferences.colorPreset);
    root.setAttribute('data-style', preferences.stylePreset);
    root.setAttribute('data-radius', preferences.borderRadius);

    // Apply CSS variables
    root.style.setProperty('--color-primary', dark ? baseColor.darkText : preset.primary);
    root.style.setProperty('--color-brand', preset.brand);
    root.style.setProperty('--color-brand-hover', preset.brand);
    root.style.setProperty('--color-accent', preset.accent);
    root.style.setProperty('--color-content-bg', dark ? baseColor.darkBg : preset.lightBg);
    root.style.setProperty('--color-glass', dark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)');
    root.style.setProperty('--background', dark ? baseColor.darkBg : preset.lightBg);
    root.style.setProperty('--foreground', dark ? baseColor.darkText : '#0F172A');

    // Border radius
    root.style.setProperty('--radius', borderRadius.css);

    // Font size
    root.style.setProperty('--font-size-base', fontSize.base);
    root.style.setProperty('--font-size-small', fontSize.small);
    root.style.setProperty('--font-size-large', fontSize.large);
    root.style.setProperty('--font-size-heading', fontSize.heading);

    // Font family
    root.style.setProperty('--font-family-base', fontFamily.css);

    // Sidebar colors
    root.style.setProperty('--sidebar-bg', dark ? baseColor.darkCard : '#ffffff');
    root.style.setProperty('--sidebar-border', dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb');
    root.style.setProperty('--sidebar-text', dark ? baseColor.darkText : '#1f2937');
    root.style.setProperty('--sidebar-muted', dark ? baseColor.darkMuted : '#6b7280');
    root.style.setProperty('--sidebar-hover', dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6');
    root.style.setProperty('--sidebar-selected', dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb');
    root.style.setProperty('--sidebar-active-bg', dark ? preset.brand : preset.primary);
    root.style.setProperty('--sidebar-active-text', '#ffffff');

    // TopBar colors
    root.style.setProperty('--topbar-bg', dark ? baseColor.darkCard : '#ffffff');
    root.style.setProperty('--topbar-border', dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');
    root.style.setProperty('--topbar-text', dark ? baseColor.darkText : '#1f2937');

    // Card colors
    root.style.setProperty('--card-bg', dark ? baseColor.darkCard : '#ffffff');
    root.style.setProperty('--card-border', dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb');
    root.style.setProperty('--card-text', dark ? baseColor.darkText : '#1f2937');
    root.style.setProperty('--card-muted', dark ? baseColor.darkMuted : '#6b7280');

    // Input colors
    root.style.setProperty('--input-bg', dark ? 'rgba(255,255,255,0.05)' : '#ffffff');
    root.style.setProperty('--input-border', dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb');
    root.style.setProperty('--input-text', dark ? baseColor.darkText : '#1f2937');

    // Body
    root.style.setProperty('color-scheme', dark ? 'dark' : 'light');
    return () => window.clearTimeout(darkTimeout);
  }, [preferences]);

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemMqRef.current = mq;

    const handler = () => {
      const dark = mq.matches;
      window.setTimeout(() => setIsDark(dark), 0);
      document.documentElement.classList.toggle('dark', dark);

      // Re-apply all theme variables when system preference changes
      const root = document.documentElement;
      const preset = COLOR_PRESETS[preferences.colorPreset] || COLOR_PRESETS.emerald;
      const baseColor = BASE_COLORS[preferences.baseColor] || BASE_COLORS.neutral;

      root.style.setProperty('--color-primary', dark ? baseColor.darkText : preset.primary);
      root.style.setProperty('--color-content-bg', dark ? baseColor.darkBg : preset.lightBg);
      root.style.setProperty('--background', dark ? baseColor.darkBg : preset.lightBg);
      root.style.setProperty('--foreground', dark ? baseColor.darkText : '#0F172A');
      root.style.setProperty('--color-glass', dark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--sidebar-bg', dark ? baseColor.darkCard : '#ffffff');
      root.style.setProperty('--sidebar-border', dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb');
      root.style.setProperty('--sidebar-text', dark ? baseColor.darkText : '#1f2937');
      root.style.setProperty('--sidebar-muted', dark ? baseColor.darkMuted : '#6b7280');
      root.style.setProperty('--sidebar-hover', dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6');
      root.style.setProperty('--sidebar-selected', dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb');
      root.style.setProperty('--topbar-bg', dark ? baseColor.darkCard : '#ffffff');
      root.style.setProperty('--topbar-border', dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');
      root.style.setProperty('--topbar-text', dark ? baseColor.darkText : '#1f2937');
      root.style.setProperty('--card-bg', dark ? baseColor.darkCard : '#ffffff');
      root.style.setProperty('--card-border', dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb');
      root.style.setProperty('--card-text', dark ? baseColor.darkText : '#1f2937');
      root.style.setProperty('--card-muted', dark ? baseColor.darkMuted : '#6b7280');
      root.style.setProperty('--input-bg', dark ? 'rgba(255,255,255,0.05)' : '#ffffff');
      root.style.setProperty('--input-border', dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb');
      root.style.setProperty('--input-text', dark ? baseColor.darkText : '#1f2937');
      root.style.setProperty('color-scheme', dark ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preferences.themeMode, preferences.colorPreset, preferences.baseColor]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setPreferences(prev => {
      const next = { ...prev, themeMode: mode };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setColorPreset = useCallback((preset: ThemePreset) => {
    setPreferences(prev => {
      const next = { ...prev, colorPreset: preset };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setFontFamily = useCallback((font: FontFamily) => {
    setPreferences(prev => {
      const next = { ...prev, fontFamily: font };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setFontSize = useCallback((size: FontSize) => {
    setPreferences(prev => {
      const next = { ...prev, fontSize: size };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setBorderRadius = useCallback((radius: BorderRadius) => {
    setPreferences(prev => {
      const next = { ...prev, borderRadius: radius };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setBaseColor = useCallback((color: BaseColor) => {
    setPreferences(prev => {
      const next = { ...prev, baseColor: color };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setChartColor = useCallback((color: ChartColor) => {
    setPreferences(prev => {
      const next = { ...prev, chartColor: color };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const setStylePreset = useCallback((style: StylePreset) => {
    setPreferences(prev => {
      const next = { ...prev, stylePreset: style };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const updatePreferences = useCallback((prefs: Partial<AppearancePreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...prefs };
      savePreferencesToStorage(userId ?? null, next);
      return next;
    });
  }, [userId]);

  const savePreferences = useCallback(async () => {
    // Always save to localStorage first
    savePreferencesToStorage(userId ?? null, preferences);

    if (!userId) return true;

    try {
      const res = await fetch(`/api/settings/appearance/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({
          themeMode: preferences.themeMode,
          colorPreset: preferences.colorPreset,
          fontFamily: preferences.fontFamily,
          fontSize: preferences.fontSize,
        }),
      });
      if (!res.ok) {
        console.warn('Failed to save appearance preferences to server');
      }
      return true;
    } catch {
      console.warn('Failed to save appearance preferences to server');
      return true; // Still saved to localStorage
    }
  }, [userId, preferences]);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        isDark,
        setThemeMode,
        setColorPreset,
        setFontFamily,
        setFontSize,
        setBorderRadius,
        setBaseColor,
        setChartColor,
        setStylePreset,
        updatePreferences,
        savePreferences,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
