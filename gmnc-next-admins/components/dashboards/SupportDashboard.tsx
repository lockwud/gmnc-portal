import { useState } from 'react';
import { Search as SearchIcon, Clock as ClockIcon, AlertCircle as AlertCircleIcon, CheckCircle2 as CheckCircle2Icon, Inbox as InboxIcon, Phone as PhoneIcon, Mail as MailIcon, History as HistoryIcon, MessageSquareIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table } from '@/components/ui/Table';
import { Drawer } from '@/components/ui/Drawer';
import { OryxStatCard } from '@/components/ui/OryxStatCard';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const TICKETS = [
  {
    id: 'TKT-001',
    user: 'Sarah Mitchell',
    issue: 'Unable to download patient reports. The PDF button is greyed out.',
    priority: 'High',
    status: 'In Progress',
    date: '2024-01-15'
  },
  {
    id: 'TKT-002',
    user: 'Dr. Evans',
    issue: 'Platform login timeout after 5 minutes. Very disruptive during sessions.',
    priority: 'Critical',
    status: 'Open',
    date: '2024-01-15'
  },
  {
    id: 'TKT-003',
    user: 'Michael Chen',
    issue: 'Tablet app freezes when switching between children.',
    priority: 'Medium',
    status: 'Resolved',
    date: '2024-01-14'
  },
  {
    id: 'TKT-004',
    user: 'James Peterson',
    issue: 'Billing statement not accessible for last month.',
    priority: 'Low',
    status: 'Open',
    date: '2024-01-14'
  },
  {
    id: 'TKT-005',
    user: 'Lisa Rodriguez',
    issue: 'Therapist profile picture not displaying correctly.',
    priority: 'Low',
    status: 'Escalated',
    date: '2024-01-13'
  }
];

export function SupportDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isManualTicketModalOpen, setIsManualTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  };

  const filteredTickets = TICKETS.filter(ticket => {
    const matchesSearch = ticket.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Queue</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Service Level Agreement: Healthy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#059669] transition-colors" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F3F4F6] border-transparent focus:border-[#059669]/20 focus:bg-white focus:ring-4 focus:ring-[#059669]/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-900 w-64 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => setIsManualTicketModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-[#059669] hover:text-[#059669] transition-all shadow-sm"
          >
            Manual Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
          <button 
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={cn(
              "px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all whitespace-nowrap",
              priorityFilter === p 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            {p} Priority
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OryxStatCard
          title="New Tickets"
          value="12"
          icon={<InboxIcon size={20} />}
          subMetrics={[{ label: 'Unassigned', value: 4, color: 'rose' }]}
        />
        <OryxStatCard
          title="Avg Response"
          value="14m"
          icon={<ClockIcon size={20} />}
          subMetrics={[{ label: 'Goal', value: '<15m', color: 'emerald' }]}
        />
        <OryxStatCard
          title="Queue Status"
          value="Healthy"
          icon={<AlertCircleIcon size={20} />}
          subMetrics={[{ label: 'Backlog', value: 3, color: 'amber' }]}
        />
        <OryxStatCard
          title="Resolved Today"
          value="24"
          icon={<CheckCircle2Icon size={20} />}
          subMetrics={[{ label: 'Efficiency', value: '94%', color: 'emerald' }]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket Queue */}
        <div className="lg:col-span-8 space-y-8">
          <Table
            title="Active Support Queue"
            data={filteredTickets}
            columns={[
              { header: 'ID', accessor: 'id', className: 'font-mono text-[10px] font-bold text-slate-500' },
              { header: 'User', accessor: 'user', className: 'font-extrabold text-slate-900' },
              { header: 'Issue', accessor: 'issue', className: 'text-slate-500 text-xs font-medium max-w-[200px] truncate' },
              {
                header: 'Priority',
                accessor: (item) => (
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                    item.priority === 'Critical' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      item.priority === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                  )}>
                    {item.priority}
                  </span>
                )
              },
              {
                header: 'Status',
                accessor: (item) => (
                  <span className={cn(
                    "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest",
                    item.status === 'Open' ? 'text-blue-600' :
                      item.status === 'In Progress' ? 'text-amber-600' :
                        item.status === 'Escalated' ? 'text-emerald-600' :
                          'text-emerald-600'
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      item.status === 'Open' ? 'bg-blue-500' :
                        item.status === 'In Progress' ? 'bg-amber-500' :
                          item.status === 'Escalated' ? 'bg-emerald-500' :
                            'bg-emerald-500'
                    )} />
                    {item.status}
                  </span>
                )
              },
            ]}
            onRowClick={handleTicketClick}
          />

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">User Lookup</h3>
                <PhoneIcon className="text-slate-300" size={20} />
             </div>
             <div className="flex gap-4">
                <div className="relative flex-1">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                     placeholder="Search users to view profiles or escalate tickets..." 
                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                   />
                </div>
                <Button variant="amber" className="px-8 font-bold rounded-2xl">Search</Button>
             </div>
          </div>
        </div>

        {/* Sidebar: SLA & FAQs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase tracking-widest opacity-60">SLA Monitoring</h3>
              <ClockIcon size={18} className="text-[#059669]" />
            </div>
            <div className="space-y-6">
              {[
                { label: 'Critical Response', time: '12m remaining', val: 85, color: 'rose' },
                { label: 'Standard Support', time: '2h 15m remaining', val: 30, color: 'emerald' },
              ].map((sla, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{sla.label}</span>
                    <span className={sla.color === 'rose' ? 'text-emerald-600' : 'text-emerald-600'}>{sla.time}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-500", sla.color === 'rose' ? "bg-emerald-500" : "bg-emerald-500")} style={{ width: `${sla.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase tracking-widest opacity-60">FAQ Management</h3>
              <MessageSquareIcon size={18} className="text-blue-500" />
            </div>
            <div className="space-y-4">
               {[
                 'Adding new providers',
                 'Billing cycle issues',
                 'Telehealth setup guide',
               ].map(q => (
                 <button key={q} className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all text-xs font-bold text-slate-600 flex items-center justify-between">
                    {q}
                    <InboxIcon size={12} className="text-slate-300" />
                 </button>
               ))}
            </div>
            <button className="w-full mt-4 py-3 border border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:border-primary/20 hover:text-primary transition-all">
               Manage All FAQs
            </button>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Ticket Detail: ${selectedTicket?.id}`}
      >
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="text-[10px] font-bold text-[#059669] uppercase tracking-widest mb-4">User Contact</h4>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
                {selectedTicket?.user.charAt(0)}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-base tracking-tight">{selectedTicket?.user}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Premium Member • 2024</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#059669] hover:border-emerald-100 transition-all shadow-sm">
                <MailIcon size={14} /> Email
              </button>
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-[#059669] hover:border-emerald-100 transition-all shadow-sm">
                <PhoneIcon size={14} /> Call
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Reported</h4>
            <div className="p-5 rounded-2xl bg-white border border-slate-100 text-[13px] text-slate-600 leading-relaxed font-medium shadow-sm">
              {selectedTicket?.issue}. User reports they are unable to see the "Download PDF" button on the clinical notes page. They have tried clearing cache and restarting the browser.
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon size={14} /> Interaction History
            </h4>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center z-10 shadow-sm group hover:border-[#059669]/30 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[13px] font-bold text-slate-900">Ticket Created</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Today • 09:12 AM</p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center z-10 shadow-sm group hover:border-[#059669]/30 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <p className="text-[13px] font-bold text-slate-900">Assigned to Support Agent</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">Today • 10:05 AM</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
            <textarea
              placeholder="Add internal note or reply to user..."
              className="w-full bg-[#F3F4F6] border-transparent focus:border-[#059669]/20 focus:bg-white focus:ring-4 focus:ring-[#059669]/5 rounded-2xl p-4 text-[13px] text-slate-900 font-medium min-h-[120px] transition-all outline-none"
            />
            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-[#059669] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity">Send Reply</button>
              <button className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      </Drawer>

      <Modal 
        isOpen={isManualTicketModalOpen} 
        onClose={() => setIsManualTicketModalOpen(false)} 
        title="Create Support Ticket"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Name</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all" placeholder="Enter user name" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all appearance-none cursor-pointer">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Description</label>
            <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all min-h-[100px] resize-none" placeholder="Describe the problem..." />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => setIsManualTicketModalOpen(false)}
              className="flex-1 py-3 bg-[#059669] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-opacity"
            >
              Create Ticket
            </button>
            <button 
              onClick={() => setIsManualTicketModalOpen(false)}
              className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
