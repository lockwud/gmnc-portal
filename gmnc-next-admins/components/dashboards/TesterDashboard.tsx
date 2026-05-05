'use client';

import React from 'react';
import { Table } from '@/components/ui/Table';
import { 
  ServerIcon, 
  ActivityIcon, 
  TerminalIcon, 
  ShieldAlertIcon,
  ZapIcon,
  DatabaseIcon,
  CpuIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OryxStatCard } from '@/components/ui/OryxStatCard';

export function TesterDashboard() {
  const [selectedEnv, setSelectedEnv] = React.useState('Production-Mirror');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Super Tester Console</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Environment: {selectedEnv} (v2.5.1-stable)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded">
             {['Staging', 'Prod'].map(e => (
               <button 
                 key={e} 
                 onClick={() => setSelectedEnv(e === 'Prod' ? 'Production-Mirror' : 'Staging')}
                 className={cn(
                   "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                   (selectedEnv.includes(e)) ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {e}
               </button>
             ))}
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <ShieldAlertIcon size={14} />
            Kill Switch
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OryxStatCard 
          title="API Gateway Status"
          value="Healthy"
          icon={<ZapIcon size={20} className="text-emerald-500" />}
          subMetrics={[{ label: 'Uptime', value: '99.99%', color: 'emerald' }]}
        />
        <OryxStatCard 
          title="System Errors (24h)"
          value="14"
          icon={<ActivityIcon size={20} className="text-emerald-500" />}
          subMetrics={[{ label: 'Resolved', value: '12', color: 'blue' }]}
        />
        <OryxStatCard 
          title="Engine Version"
          value="v2.5.1"
          icon={<CpuIcon size={20} className="text-[#059669]" />}
          subMetrics={[{ label: 'Build', value: '88201', color: 'slate' }]}
        />
        <OryxStatCard 
          title="Active Test Sessions"
          value="8"
          icon={<DatabaseIcon size={20} className="text-blue-500" />}
          subMetrics={[{ label: 'Queue', value: 'Normal', color: 'emerald' }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Feature Testing Panel */}
        <div className="bg-white rounded border border-slate-200 p-6">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
            <TerminalIcon size={18} className="text-[#059669]" /> Feature Testing Panel
          </h3>
          <div className="space-y-4">
             <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Test as Admin', role: 'admin' },
                  { label: 'Test as Provider', role: 'provider' },
                  { label: 'Test as Caregiver', role: 'caregiver' },
                ].map((btn) => (
                  <button key={btn.role} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <ShieldAlertIcon size={12} />
                    {btn.label}
                  </button>
                ))}
             </div>
             <div className="pt-4 border-t border-slate-50 space-y-3">
                {[
                  { title: 'Stress Test API', sub: 'k6 load test', icon: ZapIcon },
                  { title: 'Mock API Failure', sub: 'Simulate 500 error', icon: ShieldAlertIcon },
                ].map((test, idx) => (
                  <button key={idx} className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#059669]/20 transition-all flex items-center justify-between group">
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">{test.title}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{test.sub}</p>
                    </div>
                    <test.icon size={14} className="text-slate-300 group-hover:text-[#059669]" />
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* System Health / API Logs */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase tracking-widest opacity-60 flex items-center gap-2">
               <ServerIcon size={18} className="text-emerald-500" /> API Activity Logs
             </h3>
             <button className="text-[10px] font-bold text-[#059669] uppercase tracking-widest hover:underline">Export Logs</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
             {[
               { method: 'POST', path: '/api/v1/telehealth/session', status: 200, latency: '12ms' },
               { method: 'GET', path: '/api/v1/patients/CP-882-001', status: 200, latency: '8ms' },
               { method: 'PUT', path: '/api/v1/tasks/assign', status: 201, latency: '142ms' },
               { method: 'POST', path: '/api/v1/auth/login', status: 401, latency: '5ms', error: 'Invalid credentials' },
               { method: 'GET', path: '/api/v1/system/health', status: 200, latency: '22ms' },
             ].map((log, idx) => (
               <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 text-[11px] font-medium group hover:border-[#059669]/10 transition-all">
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold",
                    log.status >= 400 ? "bg-emerald-50 text-emerald-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {log.method}
                  </div>
                  <code className="flex-1 text-slate-500 text-[10px] truncate">{log.path}</code>
                  <div className="flex items-center gap-3">
                     <span className={cn("font-bold", log.status >= 400 ? "text-emerald-500" : "text-emerald-500")}>{log.status}</span>
                     <span className="text-slate-300 font-bold">{log.latency}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bug Tracker */}
      <div className="pt-4">
        <Table 
          title="Active Bug Tracker"
          data={[
            { id: 'BUG-401', title: 'Video lag in telehealth', severity: 'Critical', status: 'In Review', dev: 'Alice.D' },
            { id: 'BUG-405', title: 'Mobile menu overlap', severity: 'Low', status: 'Fixing', dev: 'Bob.S' },
            { id: 'BUG-412', title: 'Payment modal fails on Safari', severity: 'High', status: 'Backlog', dev: 'Unassigned' },
            { id: 'BUG-415', title: 'Broken link in footer', severity: 'Low', status: 'Completed', dev: 'Charlie.M' },
          ]}
          columns={[
            { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-slate-400' },
            { header: 'Title', accessor: 'title', className: 'font-extrabold text-slate-900' },
            { 
              header: 'Severity', 
              accessor: (item) => (
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                  item.severity === 'Critical' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  item.severity === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                )}>
                  {item.severity}
                </span>
              )
            },
            { header: 'Status', accessor: 'status', className: 'text-[11px] font-bold uppercase text-slate-500' },
            { header: 'Assigned Dev', accessor: 'dev', className: 'text-[11px] font-bold text-slate-400' },
          ]}
          actions={() => (
            <button className="text-[10px] font-bold hover:underline uppercase tracking-widest">
               Update Status
            </button>
          )}
        />
      </div>
    </div>
  );
}
