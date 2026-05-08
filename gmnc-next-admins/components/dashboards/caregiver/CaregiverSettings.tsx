"use client";

import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { User, Bell, Heart, Shield, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function CaregiverSettings() {
  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: <User />,
      component: (
        <div className="space-y-8">
          <div>
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Caregiver Profile</h3>
             <p className="text-sm text-slate-500 font-medium">Manage your personal contact information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField label="Full Name">
                <Input defaultValue="Tijani Dromo" className="h-12" />
             </FormField>
             <FormField label="Relationship to Patient">
                <Input defaultValue="Parent" className="h-12" />
             </FormField>
          </div>
          <Button className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold border-none" onClick={() => toast.success("Settings saved!")}>Save Profile</Button>
        </div>
      )
    },
    {
      id: 'monitoring',
      label: 'Care Alerts',
      icon: <Bell />,
      component: (
        <div className="space-y-8">
          <div>
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Monitoring Alerts</h3>
             <p className="text-sm text-slate-500 font-medium">Configure when you want to receive health notifications.</p>
          </div>
          <div className="space-y-4">
             {[
                'Abnormal Heart Rate Alert',
                'Medication Reminder Notification',
                'Daily Summary Report',
                'Telehealth Call Reminders'
             ].map(setting => (
                <div key={setting} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="font-bold text-slate-700">{setting}</span>
                   <button className="w-12 h-6 bg-emerald-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                   </button>
                </div>
             ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <SettingsLayout 
      title="Caregiver Settings"
      description="Customize your monitoring dashboard and notification preferences."
      tabs={tabs}
    />
  );
}
