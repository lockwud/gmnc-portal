'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Save, CalendarDays, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getAppointmentSettings, updateAppointmentSettings, DEFAULT_SETTINGS } from '@/lib/api/settings';
import type { AppointmentSettingsType } from '@/lib/api/types';

type WorkingHours = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_WORKING_HOURS: WorkingHours[] = DAYS.map(day => ({
  day,
  enabled: day !== 'Sunday',
  start: day === 'Sunday' ? '10:00' : '09:00',
  end: day === 'Sunday' ? '14:00' : '17:00',
}));

export default function WorkingHoursSettings() {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(DEFAULT_WORKING_HOURS);
  const [fullSettings, setFullSettings] = useState<AppointmentSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAppointmentSettings();
        setFullSettings(data);
        if (data?.workingHours) {
          const loadedHours = DAYS.map(day => {
            const dayData = data.workingHours?.find(h => h.day === day);
            return dayData || { day, enabled: day !== 'Sunday', start: '09:00', end: '17:00' };
          });
          setWorkingHours(loadedHours);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleDayToggle = (day: string, enabled: boolean) => {
    setWorkingHours(hours => hours.map(h => 
      h.day === day ? { ...h, enabled } : h
    ));
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setWorkingHours(hours => hours.map(h => 
      h.day === day ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = fullSettings || DEFAULT_SETTINGS;
      await updateAppointmentSettings({
        ...settingsToSave,
        workingHours: workingHours,
      });
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
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
          <Link href="/settings/appointments" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Working Hours</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure your practice hours and appointment slots for each day.
            </p>
          </div>
        </header>

        <div className="flex h-[calc(100vh-200px)] flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {workingHours.map((wh) => (
              <div key={wh.day} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <CalendarDays className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{wh.day}</h3>
                      <p className="text-xs text-slate-400">
                        {wh.enabled ? `${wh.start} - ${wh.end}` : 'Closed'}
                      </p>
                    </div>
                  </div>
                  <label className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${wh.enabled ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-200 border-slate-200'}`}>
                    <input
                      type="checkbox"
                      checked={wh.enabled}
                      onChange={(e) => handleDayToggle(wh.day, e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ${wh.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </label>
                </div>

                {wh.enabled && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Start Time</p>
                      <input
                        type="time"
                        value={wh.start}
                        onChange={(e) => handleTimeChange(wh.day, 'start', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">End Time</p>
                      <input
                        type="time"
                        value={wh.end}
                        onChange={(e) => handleTimeChange(wh.day, 'end', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
          ))}
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
              <p className="text-sm text-slate-500">Your working hours have been updated successfully.</p>
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