'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTheme } from '@/lib/context/ThemeContext';
import SelectDropdown from '@/components/ui/SelectDropdown';
import {
  COLOR_PRESETS,
  FONT_FAMILIES,
  FONT_SIZES,
  BORDER_RADIUS,
  BASE_COLORS,
  CHART_COLORS,
  STYLE_PRESETS,
  THEME_COLOR_OPTIONS,
  type ThemePreset,
  type FontFamily,
  type FontSize,
  type BorderRadius,
  type BaseColor,
  type ChartColor,
  type StylePreset,
  type ThemeMode,
} from '@/lib/context/ThemeContext';

/* ── Reusable Section Card ─────────────────────────────────────────── */

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        border: '1px solid var(--card-border)',
        backgroundColor: 'var(--card-bg)',
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--card-muted)' }}>
      {children}
    </span>
  );
}

/* ── Theme Mode Pill Button ────────────────────────────────────────── */

function ThemeModeButton({ label, active, onClick, icon }: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-brand)' : 'transparent',
        color: active ? '#ffffff' : 'var(--card-text)',
        border: `1px solid ${active ? 'var(--color-brand)' : 'var(--card-border)'}`,
      }}
    >
      {icon}
      {active && (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

/* ── Dropdown (uses assessment-style rounded pill design) ─────────── */

function Dropdown({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--card-muted)' }}>{label}</span>
      <SelectDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Select"
      />
    </div>
  );
}

/* ── Style Card ────────────────────────────────────────────────────── */

function StyleCard({ name, description, active, onClick }: {
  name: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col rounded-xl p-4 text-left transition-all min-w-[150px] flex-1"
      style={{
        border: `2px solid ${active ? 'var(--color-brand)' : 'var(--card-border)'}`,
        backgroundColor: active ? 'color-mix(in srgb, var(--color-brand) 5%, transparent)' : 'transparent',
      }}
    >
      {active && (
        <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}>
          Active
        </span>
      )}
      <span className="text-sm font-semibold" style={{ color: 'var(--card-text)' }}>{name}</span>
      <span className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--card-muted)' }}>{description}</span>
      <div className="flex gap-1.5 mt-3">
        <div className="h-2.5 w-8 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }} />
        <div className="h-2.5 w-5 rounded-full" style={{ backgroundColor: 'var(--card-border)' }} />
      </div>
    </button>
  );
}

/* ── Color Dot Button (for theme/chart/base color) ─────────────────── */

function ColorDotButton({ name, color, active, onClick }: {
  name: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all whitespace-nowrap"
      style={{
        backgroundColor: active ? 'color-mix(in srgb, var(--color-brand) 8%, transparent)' : 'transparent',
        border: `1.5px solid ${active ? 'var(--color-brand)' : 'var(--card-border)'}`,
        color: 'var(--card-text)',
      }}
    >
      <span
        className="inline-block h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-medium">{name}</span>
      {active && (
        <svg className="h-3.5 w-3.5 ml-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand)' }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

/* ── Base Color Button (simple text pill) ───────────────────────────── */

function BaseColorButton({ name, active, onClick }: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--color-brand)' : 'transparent',
        color: active ? '#ffffff' : 'var(--card-text)',
        border: `1px solid ${active ? 'var(--color-brand)' : 'var(--card-border)'}`,
      }}
    >
      {active && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      <span>{name}</span>
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────── */

export default function AppearanceSettingsPage() {
  const {
    preferences,
    setThemeMode,
    setColorPreset,
    setFontFamily,
    setFontSize,
    setBorderRadius,
    setBaseColor,
    setChartColor,
    setStylePreset,
    savePreferences,
  } = useTheme();

  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setShowSaved(false);
    try {
      await savePreferences();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch {
      // saved to localStorage at minimum
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setThemeMode('dark');
    setColorPreset('amber');
    setFontFamily('roboto');
    setFontSize('medium');
    setBorderRadius('default');
    setBaseColor('neutral');
    setChartColor('blue');
    setStylePreset('default');
  };

  // Map themeMode preference to a theme color for the color picker
  const currentThemeColorName = preferences.colorPreset;

  return (
    <ProtectedRoute requiredRole={["admin", "provider"]}>
      <div className="w-full pb-8 pt-4">
        <div className="w-full px-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-80 transition-opacity" style={{ color: 'var(--card-text)' }}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--card-text)' }}>Appearance</h1>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--card-muted)' }}>
                  Compact workspace styling. Changes apply instantly across the application.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-xs font-medium transition-all hover:opacity-80"
              style={{
                border: '1px solid var(--card-border)',
                color: 'var(--card-text)',
                backgroundColor: 'transparent',
              }}
            >
              Reset to defaults
            </button>
          </header>

          {/* ── Scrollable Content ─────────────────────────────── */}
          <div className="flex h-[calc(100vh-180px)] flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <div className="space-y-4 pb-4">

                {/* ── Theme + Radius + Font + Heading ──────────── */}
                <SectionCard>
                  <div className="flex flex-wrap items-end gap-6">
                    {/* Theme mode */}
                    <div className="flex flex-col gap-2">
                      <SectionLabel>Theme</SectionLabel>
                      <div className="flex gap-2">
                        <ThemeModeButton
                          label="Dark"
                          active={preferences.themeMode === 'dark'}
                          onClick={() => setThemeMode('dark')}
                          icon={<span className="material-icons text-sm">dark_mode</span>}
                        />
                        <ThemeModeButton
                          label="Light"
                          active={preferences.themeMode === 'light'}
                          onClick={() => setThemeMode('light')}
                          icon={<span className="material-icons text-sm">light_mode</span>}
                        />
                        <ThemeModeButton
                          label="System"
                          active={preferences.themeMode === 'system'}
                          onClick={() => setThemeMode('system')}
                          icon={<span className="material-icons text-sm">computer</span>}
                        />
                      </div>
                    </div>

                    {/* Radius */}
                    <Dropdown
                      label="Radius"
                      value={preferences.borderRadius}
                      options={Object.keys(BORDER_RADIUS).map(k => ({ label: BORDER_RADIUS[k as BorderRadius].name, value: k }))}
                      onChange={(v) => setBorderRadius(v as BorderRadius)}
                    />

                    {/* Font */}
                    <Dropdown
                      label="Font"
                      value={preferences.fontFamily}
                      options={Object.keys(FONT_FAMILIES).map(k => ({ label: FONT_FAMILIES[k as FontFamily].name, value: k }))}
                      onChange={(v) => setFontFamily(v as FontFamily)}
                    />

                    {/* Heading */}
                    <Dropdown
                      label="Heading"
                      value={preferences.fontSize}
                      options={Object.keys(FONT_SIZES).map(k => ({ label: FONT_SIZES[k as FontSize].name, value: k }))}
                      onChange={(v) => setFontSize(v as FontSize)}
                    />
                  </div>
                </SectionCard>

                {/* ── Style ────────────────────────────────────── */}
                <SectionCard>
                  <SectionLabel>Style</SectionLabel>
                  <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                    {(Object.keys(STYLE_PRESETS) as StylePreset[]).map((styleId) => (
                      <StyleCard
                        key={styleId}
                        name={STYLE_PRESETS[styleId].name}
                        description={STYLE_PRESETS[styleId].description}
                        active={preferences.stylePreset === styleId}
                        onClick={() => setStylePreset(styleId)}
                      />
                    ))}
                  </div>
                </SectionCard>

                {/* ── Base Color ───────────────────────────────── */}
                <SectionCard>
                  <SectionLabel>Base Color</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(Object.keys(BASE_COLORS) as BaseColor[]).map((colorId) => (
                      <BaseColorButton
                        key={colorId}
                        name={BASE_COLORS[colorId].name}
                        active={preferences.baseColor === colorId}
                        onClick={() => setBaseColor(colorId)}
                      />
                    ))}
                  </div>
                </SectionCard>

                {/* ── Theme Color ──────────────────────────────── */}
                <SectionCard>
                  <SectionLabel>Theme Color</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {THEME_COLOR_OPTIONS.map((tc) => {
                      const preset = (tc.preset ?? tc.id) as ThemePreset;
                      const isActive = preferences.colorPreset === preset;
                      return (
                        <ColorDotButton
                          key={tc.id}
                          name={tc.name}
                          color={tc.color}
                          active={isActive}
                          onClick={() => setColorPreset(preset)}
                        />
                      );
                    })}
                  </div>
                </SectionCard>

                {/* ── Chart Color ──────────────────────────────── */}
                <SectionCard>
                  <SectionLabel>Chart Color</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(Object.keys(CHART_COLORS) as ChartColor[]).map((colorId) => (
                      <ColorDotButton
                        key={colorId}
                        name={CHART_COLORS[colorId].name}
                        color={CHART_COLORS[colorId].color}
                        active={preferences.chartColor === colorId}
                        onClick={() => setChartColor(colorId)}
                      />
                    ))}
                  </div>
                </SectionCard>

                {/* ── Preview ──────────────────────────────────── */}
                <SectionCard>
                  <SectionLabel>Preview</SectionLabel>
                  <div className="mt-3 space-y-4">
                    {/* Typography */}
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--card-text)' }}>Typography preview</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--card-muted)' }}>The quick brown fox jumps over the lazy dog.</p>
                    </div>

                    {/* Workspace + Status row */}
                    <div className="flex items-stretch gap-4">
                      {/* Workspace settings card */}
                      <div
                        className="flex flex-col justify-between rounded-xl p-4 flex-1 min-w-0"
                        style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--input-bg)' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold" style={{ color: 'var(--card-text)' }}>Workspace settings</span>
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}>Active</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded-lg px-4 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-brand)' }}>Primary</button>
                          <button className="rounded-lg px-4 py-1.5 text-xs font-medium" style={{ border: '1px solid var(--card-border)', color: 'var(--card-text)' }}>Secondary</button>
                          <button className="rounded-lg px-4 py-1.5 text-xs font-medium" style={{ border: '1px solid var(--card-border)', color: 'var(--card-text)' }}>Accent</button>
                        </div>
                      </div>

                      {/* Status card */}
                      <div
                        className="flex flex-col justify-between rounded-xl p-4 flex-1 min-w-0"
                        style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--input-bg)' }}
                      >
                        <div>
                          <span className="text-xs font-semibold" style={{ color: 'var(--card-text)' }}>Status</span>
                          <p className="text-xs mt-1" style={{ color: 'var(--card-muted)' }}>All systems normal</p>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: 'var(--color-brand)', width: '78%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

              </div>
            </div>

            {/* ── Sticky Save Button ──────────────────────────── */}
            <div className="sticky bottom-0 z-10 flex justify-end pt-4 pb-4" style={{ borderTop: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <div className="flex items-center gap-3">
              {showSaved && (
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-brand)' }}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg px-6 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
