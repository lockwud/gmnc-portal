'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft, Video, Settings } from 'lucide-react';
import { getTelehealthSettings, updateTelehealthSettings } from '@/lib/api/telehealth';
import type { TelehealthSettingsType } from '@/lib/api/types';

const DEFAULT_TELEHEALTH_SETTINGS: TelehealthSettingsType = {
  enableTelehealth: true,
  defaultProviderMinutes: 30,
  maxConcurrentSessions: 5,
  recordingEnabled: false,
  waitingRoomEnabled: true,
  requireApproval: false,
  sessionTimeout: 30,
  connectTimeout: 10,
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

export default function TelehealthSettingsPage() {
  const [settings, setSettings] = useState<TelehealthSettingsType>({ ...DEFAULT_TELEHEALTH_SETTINGS });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getTelehealthSettings();
        if (data) {
          setSettings({ ...DEFAULT_TELEHEALTH_SETTINGS, ...data });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTelehealthSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
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
    <ProtectedRoute>
      <div className="w-full pb-8 pt-4">
        <div className="w-full px-6">
          <header className="mb-5 flex items-center gap-3">
            <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Telehealth Configuration</h1>
              <p className="mt-1 text-sm text-slate-500">
                Configure telehealth settings and integration options.
              </p>
            </div>
          </header>

          <div className="flex h-[calc(100vh-200px)] flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <div className="space-y-6 pb-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <Video className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">Telehealth Settings</h3>
                      <p className="mt-1 text-xs text-slate-500">Configure telehealth session parameters</p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-700">Enable Telehealth</p>
                            <p className="text-xs text-slate-400">Allow telehealth consultations</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.enableTelehealth}
                            onChange={(checked) => setSettings({ ...settings, enableTelehealth: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Default Provider Session Duration</p>
                          <NumberInput
                            value={settings.defaultProviderMinutes}
                            onChange={(val) => setSettings({ ...settings, defaultProviderMinutes: val })}
                            min={15}
                            max={120}
                            unit="minutes"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Max Concurrent Sessions</p>
                          <NumberInput
                            value={settings.maxConcurrentSessions}
                            onChange={(val) => setSettings({ ...settings, maxConcurrentSessions: val })}
                            min={1}
                            max={20}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900">Session Settings</h3>
                      <p className="mt-1 text-xs text-slate-500">Configure session behavior and timeouts</p>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-700">Enable Recording</p>
                            <p className="text-xs text-slate-400">Record telehealth sessions</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.recordingEnabled}
                            onChange={(checked) => setSettings({ ...settings, recordingEnabled: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-700">Waiting Room</p>
                            <p className="text-xs text-slate-400">Patients wait before entering</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.waitingRoomEnabled}
                            onChange={(checked) => setSettings({ ...settings, waitingRoomEnabled: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-700">Require Approval</p>
                            <p className="text-xs text-slate-400">Provider must approve entry</p>
                          </div>
                          <ToggleSwitch
                            checked={settings.requireApproval}
                            onChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Session Timeout</p>
                          <NumberInput
                            value={settings.sessionTimeout}
                            onChange={(val) => setSettings({ ...settings, sessionTimeout: val })}
                            min={5}
                            max={120}
                            unit="minutes"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-700">Connection Timeout</p>
                          <NumberInput
                            value={settings.connectTimeout}
                            onChange={(val) => setSettings({ ...settings, connectTimeout: val })}
                            min={5}
                            max={60}
                            unit="seconds"
                          />
                        </div>
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
                className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}