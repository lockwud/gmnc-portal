'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Shield, Bell, Save, Eye, ExternalLink, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getAppointmentSettings, updateAppointmentSettings } from '@/lib/api/settings';
import type { AppointmentSettingsType } from '@/lib/api/types';
import { useToast } from '@/components/ui/Toast';

function SettingCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

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

function SettingsDisplayCard({ settings }: { settings: AppointmentSettingsType }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Eye className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">Current Settings</h3>
          <p className="mt-1 text-xs text-slate-500">Your configured appointment preferences</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Booking</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.allowPatientBooking ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Min Notice</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.minAppointmentNotice} hours
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Default Duration</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.defaultDuration} minutes
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Daily Max</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.maxDailyAppointments} appointments
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Reminders</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.enableReminders ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Working Hours</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.workingHours?.[0]?.start ?? '09:00'} - {settings.workingHours?.[0]?.end ?? '17:00'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Slot Interval</p>
              <p className="text-sm font-medium text-slate-900">
                {settings.slotInterval} minutes
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/settings/working-hours" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                Configure Hours
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_SETTINGS: AppointmentSettingsType = {
  allowPatientBooking: true,
  minAppointmentNotice: 24,
  defaultDuration: 30,
  bufferTime: 15,
  maxDailyAppointments: 20,
  enableReminders: true,
  reminderLeadTime: 2,
  requireConfirmation: false,
  enableWaitlist: true,
  slotInterval: 30,
  workingHours: [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '10:00', end: '14:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '14:00' },
  ],
};

export default function AppointmentSettings() {
  const [settings, setSettings] = useState<AppointmentSettingsType>({ ...DEFAULT_SETTINGS });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { show } = useToast();

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
    async function loadSettings() {
      try {
        setIsLoading(true);
        const data = await getAppointmentSettings();
        if (data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load settings';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('invalid token')) {
          show({ type: 'warning', title: 'Session Expired', message: 'Your session has expired. Please log in again.', duration: 5000 });
          setTimeout(() => handleAuthError(), 2000);
          return;
        }
        show({ type: 'error', title: 'Error', message: msg, duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [show, handleAuthError]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAppointmentSettings(settings);
      setIsModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('invalid token')) {
        show({ type: 'warning', title: 'Session Expired', message: 'Your session has expired. Please log in again.', duration: 5000 });
        setTimeout(() => handleAuthError(), 2000);
        return;
      }
      show({ type: 'error', title: 'Error', message: msg, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="mt-2 text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8 pt-4">
      <div className="w-full px-6">
        <header className="mb-5 flex items-center gap-3">
          <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Appointment Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure appointment scheduling, booking rules, and notification preferences.
            </p>
          </div>
        </header>

        <div className="flex h-[calc(100vh-200px)] flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-none">
            <div className="space-y-6 pb-4">
              {/* Errors are now shown via toast */}

              <SettingsDisplayCard settings={settings} />

              <SettingCard title="Booking Preferences" description="Control how patients can schedule appointments" icon={Calendar}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-700">Allow Patient Booking</p>
                  <p className="text-xs text-slate-400">Let patients self-schedule online</p>
                </div>
                <ToggleSwitch
                  checked={settings.allowPatientBooking}
                  onChange={(checked) => setSettings({ ...settings, allowPatientBooking: checked })}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Minimum Notice Required</p>
                <NumberInput
                  value={settings.minAppointmentNotice}
                  onChange={(val) => setSettings({ ...settings, minAppointmentNotice: val })}
                  min={0}
                  max={168}
                  unit="hours"
                />
                <p className="text-xs text-slate-400">Appointments must be scheduled at least this far in advance</p>
              </div>
            </div>
          </SettingCard>

          <SettingCard title="Scheduling Rules" description="Configure appointment duration and limits" icon={Clock}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Default Appointment Duration</p>
                <NumberInput
                  value={settings.defaultDuration}
                  onChange={(val) => setSettings({ ...settings, defaultDuration: val })}
                  min={15}
                  max={120}
                  unit="minutes"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Buffer Time</p>
                <NumberInput
                  value={settings.bufferTime}
                  onChange={(val) => setSettings({ ...settings, bufferTime: val })}
                  min={0}
                  max={60}
                  unit="minutes"
                />
                <p className="text-xs text-slate-400">Time between appointments for preparation</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Maximum Daily Appointments</p>
                <NumberInput
                  value={settings.maxDailyAppointments}
                  onChange={(val) => setSettings({ ...settings, maxDailyAppointments: val })}
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </SettingCard>

          <SettingCard title="Notifications" description="Configure appointment reminders" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-700">Enable Reminders</p>
                  <p className="text-xs text-slate-400">Send automatic appointment notifications</p>
                </div>
                <ToggleSwitch
                  checked={settings.enableReminders}
                  onChange={(checked) => setSettings({ ...settings, enableReminders: checked })}
                />
              </div>

              {settings.enableReminders && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700">Reminder Lead Time</p>
                  <NumberInput
                    value={settings.reminderLeadTime}
                    onChange={(val) => setSettings({ ...settings, reminderLeadTime: val })}
                    min={1}
                    max={48}
                    unit="hours"
                  />
                  <p className="text-xs text-slate-400">Send reminder this many hours before appointment</p>
                </div>
              )}
            </div>
          </SettingCard>

          <SettingCard title="Additional Options" description="Advanced appointment settings" icon={Shield}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-700">Require Confirmation</p>
                  <p className="text-xs text-slate-400">Appointments need provider approval</p>
                </div>
                <ToggleSwitch
                  checked={settings.requireConfirmation}
                  onChange={(checked) => setSettings({ ...settings, requireConfirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-700">Enable Waitlist</p>
                  <p className="text-xs text-slate-400">Allow patients to join waitlist when fully booked</p>
                </div>
                <ToggleSwitch
                  checked={settings.enableWaitlist}
                  onChange={(checked) => setSettings({ ...settings, enableWaitlist: checked })}
                />
              </div>
            </div>
          </SettingCard>

            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end border-t border-slate-200 bg-white pt-4 pb-4 shadow-sm">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full px-6 py-2 text-xs font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Save className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Settings Saved</h3>
              <p className="text-sm text-slate-500">Your appointment settings have been updated successfully.</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-medium"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}