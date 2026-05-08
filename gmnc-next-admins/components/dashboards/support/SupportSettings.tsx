"use client";

import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { User, Bell, LifeBuoy, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function SupportSettings() {
  const tabs = [
    {
      id: 'account',
      label: 'Account Info',
      icon: <User />,
      component: (
        <div className="space-y-8">
           <h3 className="text-xl font-bold">Support Agent Profile</h3>
           <FormField label="Full Name">
              <Input defaultValue="Support Agent" className="h-12" />
           </FormField>
           <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold" onClick={() => toast.success("Saved!")}>Save Settings</Button>
        </div>
      )
    }
  ];

  return (
    <SettingsLayout 
      title="Support Settings"
      description="Manage your support agent profile and preferences."
      tabs={tabs}
    />
  );
}
