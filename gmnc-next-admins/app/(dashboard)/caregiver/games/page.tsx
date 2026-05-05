"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Gamepad2Icon, DownloadIcon, TrophyIcon, StarIcon, PlayIcon, InfoIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const GAMES = [
  { name: 'Speech Bubble', cat: 'Speech', progress: 85, color: 'emerald', icon: '🗣️' },
  { name: 'Color Match', cat: 'Cognitive', progress: 42, color: 'blue', icon: '🎨' },
  { name: 'Rhythm Box', cat: 'Motor', progress: 12, color: 'amber', icon: '🥁' },
  { name: 'Word Finder', cat: 'Speech', progress: 0, color: 'rose', icon: '📚' },
];

export default function GamesPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Therapeutic Games</h1>
            <p className="text-slate-400 text-xs mt-1 font-bold">Manage and monitor your child's therapeutic play activities.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="gap-2 px-6 font-bold rounded-xl border-slate-200">
               <DownloadIcon size={18} /> Library
             </Button>
             <Button variant="amber" className="gap-2 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl">
               <TrophyIcon size={18} /> Achievements
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {GAMES.map((game) => (
             <div key={game.name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-accent/20 transition-all group">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:scale-110 transition-transform",
                  `bg-${game.color}-500`
                )}>
                  {game.icon}
                </div>
                <div className="text-center space-y-1 mb-6">
                   <h3 className="text-lg font-extrabold text-slate-900">{game.name}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{game.cat}</p>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                         <span className="text-slate-400">Mastery</span>
                         <span className="text-slate-900">{game.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div className={cn("h-full transition-all duration-1000", `bg-${game.color}-500`)} style={{ width: `${game.progress}%` }} />
                      </div>
                   </div>
                   <Button variant={game.progress > 0 ? "amber" : "outline"} className="w-full py-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-2">
                      {game.progress > 0 ? <PlayIcon size={14} fill="currentColor" /> : <DownloadIcon size={14} />}
                      {game.progress > 0 ? 'Continue' : 'Download'}
                   </Button>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 text-amber-400">
                 {[1,2,3,4,5].map(i => <StarIcon key={i} size={20} fill="currentColor" />)}
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight">Unlock New Adventures</h2>
              <p className="text-slate-400 font-medium text-lg max-w-lg">Complete weekly therapeutic goals to unlock exclusive new games designed by clinical specialists.</p>
              <Button variant="amber" className="h-14 px-10 rounded-2xl font-bold text-base shadow-2xl shadow-accent/20">View Milestone Map</Button>
           </div>
           <div className="w-64 h-64 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <TrophyIcon size={100} className="text-amber-400 animate-bounce" />
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
