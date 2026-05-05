"use client";

import React from 'react';
import { OryxStatCard } from '@/components/ui/OryxStatCard';
import { Button } from '@/components/ui/Button';
import { 
  HeartIcon, 
  CalendarIcon, 
  VideoIcon, 
  Gamepad2Icon, 
  GiftIcon, 
  HelpCircleIcon, 
  TrophyIcon,
  BellIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function CaregiverDashboard() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Tijani!</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            You have <span className="text-accent font-bold">2 appointments</span> scheduled for this week.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400">
              <BellIcon size={20} />
           </Button>
           <Button variant="amber" className="gap-2 px-8 h-14 font-bold shadow-xl shadow-accent/20 rounded-[1.25rem]">
             <CalendarIcon size={20} /> Book Session
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <OryxStatCard 
           title="Child's Progress"
           value="82%"
           icon={<HeartIcon size={20} className="text-rose-500" />}
           subMetrics={[{ label: 'Weekly', value: '+5%', color: 'emerald' }]}
         />
         <OryxStatCard 
           title="Active Rewards"
           value="1,250"
           icon={<TrophyIcon size={20} className="text-amber-500" />}
           subMetrics={[{ label: 'Points', value: 'to next gift', color: 'slate' }]}
         />
         <OryxStatCard 
           title="Completed Games"
           value="14"
           icon={<Gamepad2Icon size={20} className="text-blue-500" />}
           subMetrics={[{ label: 'New', value: '3 Unlocked', color: 'blue' }]}
         />
         <OryxStatCard 
           title="Support Status"
           value="None"
           icon={<HelpCircleIcon size={20} className="text-emerald-500" />}
           subMetrics={[{ label: 'Tickets', value: '0 Open', color: 'emerald' }]}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Upcoming Telehealth */}
         <div className="lg:col-span-8 space-y-6">
            <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Upcoming Appointments</h3>
                  <button className="text-[11px] font-bold text-accent uppercase tracking-widest hover:underline">View History</button>
               </div>
               <div className="space-y-4">
                  {[
                    { doctor: 'Dr. Louisa Parker', type: 'Speech Therapy', date: 'Tomorrow, 10:00 AM', status: 'Confirmed' },
                    { doctor: 'Dr. Mensah', type: 'Physio Session', date: 'Fri, May 15, 02:30 PM', status: 'Scheduled' },
                  ].map((apt, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-accent/10 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-accent shadow-sm">
                             <VideoIcon size={24} />
                          </div>
                          <div>
                             <p className="font-extrabold text-slate-900">{apt.doctor}</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{apt.type}</p>
                          </div>
                       </div>
                       <div className="text-right hidden sm:block">
                          <p className="font-bold text-slate-700">{apt.date}</p>
                          <Badge variant="success" className="mt-1 text-[9px] uppercase font-bold">{apt.status}</Badge>
                       </div>
                       <Button size="sm" variant="amber" className="h-10 px-6 rounded-xl font-bold shadow-lg shadow-accent/10">JOIN</Button>
                    </div>
                  ))}
               </div>
            </Card>

            {/* Well-being Games */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Therapeutic Games</h3>
                  <Gamepad2Icon className="text-blue-500" size={24} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Speech Bubble', color: 'bg-emerald-500', icon: '🗣️' },
                    { name: 'Color Match', color: 'bg-blue-500', icon: '🎨' },
                    { name: 'Rhythm Box', color: 'bg-amber-500', icon: '🥁' },
                  ].map((game) => (
                    <div key={game.name} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-center space-y-4 group cursor-pointer hover:border-accent/20 transition-all">
                       <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110", game.color)}>
                          {game.icon}
                       </div>
                       <p className="font-bold text-slate-900">{game.name}</p>
                       <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-accent">Play Now</Button>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar: Referrals & Help */}
         <div className="lg:col-span-4 space-y-6">
            <Card className="p-8 rounded-[2.5rem] border border-slate-100 shadow-sm bg-white overflow-hidden relative">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="p-3 bg-amber-50 rounded-2xl">
                       <GiftIcon size={28} className="text-amber-500" />
                     </div>
                     <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[9px] uppercase">NEW</Badge>
                  </div>
                  <div>
                     <h4 className="text-xl font-extrabold text-slate-900">Refer & Earn</h4>
                     <p className="text-slate-500 text-sm mt-2">Invite other parents and get GH₵ 50 in clinic rewards.</p>
                  </div>
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold py-6 rounded-2xl transition-all">
                     Get Referral Link
                  </Button>
               </div>
            </Card>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
               <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest opacity-60">Support Center</h4>
               <div className="space-y-4">
                  {[
                    { q: 'How to reschedule?', icon: HelpCircleIcon },
                    { q: 'Billing FAQ', icon: GiftIcon },
                    { q: 'Contact Therapist', icon: BellIcon },
                  ].map((help, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-accent/20 transition-all group">
                       <span className="text-sm font-bold text-slate-700">{help.q}</span>
                       <HelpCircleIcon size={16} className="text-slate-300 group-hover:text-accent" />
                    </button>
                  ))}
               </div>
               <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400">View Help Center</Button>
            </div>
         </div>
      </div>
    </div>
  );
}
