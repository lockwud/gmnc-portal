'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

type SettingType = 'toggle' | 'number' | 'text' | 'select' | 'multi-select' | 'textarea';

type SettingField = {
  key: string;
  label: string;
  type: SettingType;
  description?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
};

type PlatformSettingsPageProps = {
  title: string;
  description: string;
  icon?: React.ElementType;
  fields: SettingField[];
  fetchSettings: () => Promise<Record<string, unknown>>;
  updateSettings: (data: Record<string, unknown>) => Promise<unknown>;
  backHref?: string;
};

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        checked ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-200 border-slate-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
      />
      {unit && <span className="text-xs text-slate-500">{unit}</span>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function TextareaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
    />
  );
}

function MultiSelectInput({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
}) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value.includes(opt.value)
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PlatformSettingsPage({
  title,
  description,
  icon: Icon,
  fields,
  fetchSettings,
  updateSettings,
  backHref = '/settings',
}: PlatformSettingsPageProps) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { show } = useToast();
  const saveLabel = title.toLowerCase().includes('preferences') ? 'Save preferences' : 'Save settings';

  const handleAuthError = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('gmnc_token');
      localStorage.removeItem('user');
      localStorage.removeItem('gmnc_user');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await fetchSettings();
        setSettings(data || {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load settings';
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('expired') || lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid') || lowerMsg.includes('token') || lowerMsg.includes('jwt') || lowerMsg.includes('authorization') || lowerMsg.includes('forbidden') || lowerMsg.includes('permission') || lowerMsg.includes('not found')) {
          show({ type: 'warning', title: 'Session Expired', message: 'Your session has expired. Please log in again.', duration: 5000 });
          setTimeout(() => handleAuthError(), 2000);
          return;
        }
        show({ type: 'error', title: 'Error', message: msg, duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [fetchSettings, show, handleAuthError]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      show({ type: 'success', title: 'Settings Saved', message: 'Your settings have been updated successfully.', duration: 3000 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('expired') || lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid') || lowerMsg.includes('token') || lowerMsg.includes('jwt') || lowerMsg.includes('authorization') || lowerMsg.includes('forbidden') || lowerMsg.includes('permission') || lowerMsg.includes('not found')) {
        show({ type: 'warning', title: 'Session Expired', message: 'Your session has expired. Please log in again.', duration: 5000 });
        setTimeout(() => handleAuthError(), 2000);
        return;
      }
      show({ type: 'error', title: 'Error', message: msg, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={["admin", "provider"]}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-2 text-sm text-slate-500">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
      <ProtectedRoute requiredRole={["admin", "provider"]}>
      <div className="w-full pb-8 pt-4">
        <div className="w-full px-6">
          <header className="mb-5 flex items-center gap-3">
            <Link href={backHref} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </header>

          <div className="flex h-[calc(100vh-200px)] flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <div className="space-y-6 pb-4">
              {/* Error and success are now shown via toast */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    {Icon && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{description}</p>
                      <div className="mt-4 space-y-4">
                        {fields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium text-slate-700">{field.label}</p>
                                {field.description && (
                                  <p className="text-xs text-slate-400">{field.description}</p>
                                )}
                              </div>
                              {field.type === 'toggle' && (
                                <ToggleSwitch
                                  checked={!!settings[field.key]}
                                  onChange={(checked) => updateField(field.key, checked)}
                                />
                              )}
                            </div>
                            {field.type === 'number' && (
                              <NumberInput
                                value={Number(settings[field.key] || 0)}
                                onChange={(val) => updateField(field.key, val)}
                                min={field.min}
                                max={field.max}
                                unit={field.unit}
                              />
                            )}
                            {field.type === 'text' && (
                              <TextInput
                                value={String(settings[field.key] || '')}
                                onChange={(val) => updateField(field.key, val)}
                                placeholder={field.placeholder}
                              />
                            )}
                            {field.type === 'select' && field.options && (
                              <SelectInput
                                value={String(settings[field.key] || '')}
                                onChange={(val) => updateField(field.key, val)}
                                options={field.options}
                              />
                            )}
                            {field.type === 'multi-select' && field.options && (
                              <MultiSelectInput
                                value={Array.isArray(settings[field.key]) ? (settings[field.key] as string[]) : []}
                                onChange={(val) => updateField(field.key, val)}
                                options={field.options}
                              />
                            )}
                            {field.type === 'textarea' && (
                              <TextareaInput
                                value={String(settings[field.key] || '')}
                                onChange={(val) => updateField(field.key, val)}
                                placeholder={field.placeholder}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end border-t border-slate-200 bg-white pt-4 pb-4 shadow-sm">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-3 w-3" />
                {isSaving ? 'Saving...' : saveLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
