"use client";

import * as React from "react";
import { Table } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Download, Calendar, User, Shield, AlertTriangle, Terminal, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const MOCK_LOGS = [
  { id: 'LOG-001', user: 'Admin User', action: 'Update User Permission', module: 'Auth', status: 'emerald', time: '2023-10-24 14:30:22', ip: '192.168.1.1' },
  { id: 'LOG-002', user: 'Dr. Louisa Parker', action: 'Access Patient Record', module: 'Clinical', status: 'emerald', time: '2023-10-24 13:15:05', ip: '192.168.1.5' },
  { id: 'LOG-003', user: 'System', action: 'Database Backup', module: 'System', status: 'emerald', time: '2023-10-24 00:00:01', ip: '127.0.0.1' },
  { id: 'LOG-004', user: 'Unknown', action: 'Failed Login Attempt', module: 'Auth', status: 'Failed', time: '2023-10-23 23:45:10', ip: '45.12.33.2' },
  { id: 'LOG-005', user: 'Billing Manager', action: 'Generate Invoice', module: 'Financial', status: 'emerald', time: '2023-10-23 16:20:00', ip: '192.168.1.12' },
];

export function AuditLogs() {
  const [selectedLog, setSelectedLog] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleViewLog = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Terminal className="text-emerald-500" size={28} />
             System Audit Logs
          </h1>
          <p className="text-slate-500 text-sm font-medium">
             Track every action performed within the portal for compliance and security auditing.
          </p>
        </div>
        <Button
          className="h-12 gap-2 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border-none font-bold shadow-xl shadow-slate-900/10 transition-all"
          onClick={() => toast.success('Audit report generation started...')}
        >
          <Download size={18} />
          Export Audit Report
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <Table
          data={MOCK_LOGS}
          columns={[
            { header: 'Action Event', accessor: (item) => (
              <div className="flex items-center gap-4 py-1">
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                   item.status === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                 )}>
                    {item.status === 'emerald' ? <Shield size={18} /> : <AlertTriangle size={18} />}
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 tracking-tight">{item.action}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.module} Module</p>
                 </div>
              </div>
            )},
            { header: 'Performed By', accessor: (item) => (
              <div className="flex items-center gap-2">
                 <User size={14} className="text-slate-400" />
                 <span className="text-sm font-bold text-slate-700">{item.user}</span>
              </div>
            )},
            { header: 'Source IP', accessor: (item) => (
              <span className="text-xs font-mono font-bold text-slate-400">{item.ip}</span>
            )},
            { header: 'Timestamp', accessor: (item) => (
              <div className="flex items-center gap-2 text-slate-500">
                 <Calendar size={14} />
                 <span className="text-xs font-medium">{item.time}</span>
              </div>
            )},
            { header: 'Status', accessor: (item) => (
              <Badge
                color={item.status === 'emerald' ? 'emerald' : 'rose'}
                className="rounded-lg font-bold uppercase tracking-wider text-[9px]"
              >
                {item.status}
              </Badge>
            )},
          ]}
          actions={(item) => (
            <button
              onClick={() => handleViewLog(item)}
              className="p-2.5 text-slate-400 hover:text-brand hover:bg-emerald-50 rounded-xl transition-all"
              title="View Payload"
            >
               <Eye size={18} />
            </button>
          )}
        />
      </div>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Security Event Inspector"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
             <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                selectedLog?.status === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
             )}>
                {selectedLog?.status === 'emerald' ? <Shield size={28} /> : <AlertTriangle size={28} />}
             </div>
             <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{selectedLog?.action}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-[2px]">{selectedLog?.module} Module • {selectedLog?.id}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performed By</p>
                <p className="text-sm font-bold text-slate-900">{selectedLog?.user}</p>
             </div>
             <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="text-sm font-bold text-slate-900">{selectedLog?.time}</p>
             </div>
             <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source IP</p>
                <p className="text-sm font-bold font-mono text-slate-900">{selectedLog?.ip}</p>
             </div>
             <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <Badge color={selectedLog?.status === 'emerald' ? 'emerald' : 'rose'}>{selectedLog?.status}</Badge>
             </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[24px] text-emerald-400 font-mono text-xs overflow-x-auto">
             <p className="mb-2 text-white/40 font-sans font-bold uppercase text-[9px] tracking-widest">Metadata Payload</p>
             <pre className="whitespace-pre-wrap">{selectedLog ? JSON.stringify({
               event_id: selectedLog.id,
               severity: selectedLog.status === 'emerald' ? 'blue' : 'amber',
               user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
               resource_url: `/api/v1/${selectedLog.module?.toLowerCase()}/records`,
               request_method: 'POST',
             }, null, 2) : ''}</pre>
          </div>

          <Button
            className="w-full h-14 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white border-none shadow-xl shadow-slate-900/10"
            onClick={() => setIsModalOpen(false)}
          >
            Close Inspector
          </Button>
        </div>
      </Modal>
    </div>
  );
}
