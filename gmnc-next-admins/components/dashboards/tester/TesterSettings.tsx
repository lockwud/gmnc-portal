"use client";

import React from 'react';
import { SettingsLayout } from '../shared/SettingsLayout';
import { Terminal, Database, Server, Settings, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function TesterSettings() {
  const tabs = [
    {
      id: 'environment',
      label: 'Environment Config',
      icon: <Server />,
      component: (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Environment Config</h3>
            <p className="text-sm text-slate-500 font-medium">Configure target environments for test execution.</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <FormField label="Target API Base URL">
              <Input defaultValue="https://api-staging.getmyneurocare.com" className="h-12" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
               <FormField label="Mock Data Seed">
                  <Input defaultValue="12345" className="h-12" />
               </FormField>
               <FormField label="Timeout (ms)">
                  <Input defaultValue="5000" className="h-12" />
               </FormField>
            </div>
          </div>
          <Button className="h-12 px-8 rounded-xl bg-indigo-600 text-white font-bold border-none shadow-xl shadow-indigo-500/20" onClick={() => toast.success("Environment saved!")}>Save Configuration</Button>
        </div>
      )
    },
    {
      id: 'automation',
      label: 'Automation Config',
      icon: <Terminal />,
      component: (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Test Automation Settings</h3>
            <p className="text-sm text-slate-500 font-medium">Set defaults for end-to-end Cypress/Playwright suites.</p>
          </div>
          <div className="space-y-4">
             {['Run Headless', 'Capture Video on Failure', 'Generate HTML Report', 'Parallel Execution'].map(setting => (
                <div key={setting} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="font-bold text-slate-700">{setting}</span>
                   <button 
                    onClick={() => toast.success(`${setting} toggled`)}
                    className="w-12 h-6 bg-indigo-600 rounded-full relative"
                   >
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
      title="Tester & QA Settings"
      description="Manage test environments, automation suites, and QA tooling configurations."
      tabs={tabs}
    />
  );
}
