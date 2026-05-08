"use client";

import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { User, Bell, Shield, Clock, MapPin, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function ProviderSettings() {
  const tabs = [
    {
      id: 'profile',
      label: 'Clinical Profile',
      icon: <User />,
      component: (
        <div className="space-y-8">
          <div>
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Profile</h3>
             <p className="text-sm text-slate-500 font-medium">Update your professional information and specialties.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField label="Professional Bio">
                <textarea className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" placeholder="Tell us about your experience..." />
             </FormField>
             <FormField label="Medical License Number">
                <Input defaultValue="GH-MD-90210" className="h-12" />
             </FormField>
          </div>
          <Button className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold border-none" onClick={() => toast.success("Profile updated!")}>Save Changes</Button>
        </div>
      )
    },
    {
      id: 'hours',
      label: 'Working Hours',
      icon: <Clock />,
      component: (
        <div className="space-y-8">
          <div>
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">Availability Schedule</h3>
             <p className="text-sm text-slate-500 font-medium">Set your weekly clinical hours for patient bookings.</p>
          </div>
          <div className="space-y-4">
             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="font-bold text-slate-700">{day}</span>
                   <div className="flex items-center gap-4">
                      <Input type="time" defaultValue="09:00" className="w-32 h-10" />
                      <span className="text-slate-400">to</span>
                      <Input type="time" defaultValue="17:00" className="w-32 h-10" />
                   </div>
                </div>
             ))}
          </div>
          <Button className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-bold border-none" onClick={() => toast.success("Schedule updated!")}>Update Hours</Button>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Patient Alerts',
      icon: <Bell />,
      component: <div className="p-20 text-center text-slate-400 font-bold">Notification settings coming soon.</div>
    }
  ];

  return (
    <SettingsLayout 
      title="Provider Settings"
      description="Configure your clinical presence and operational preferences."
      tabs={tabs}
    />
  );
}
