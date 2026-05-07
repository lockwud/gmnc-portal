"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { DownloadIcon, TrophyIcon, StarIcon, PlayIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

const GAMES = [
  { name: "Speech Bubble", cat: "Speech", progress: 85, tone: "emerald", icon: "Speech" },
  { name: "Color Match", cat: "Cognitive", progress: 42, tone: "blue", icon: "Color" },
  { name: "Rhythm Box", cat: "Motor", progress: 12, tone: "amber", icon: "Rhythm" },
  { name: "Word Finder", cat: "Speech", progress: 0, tone: "rose", icon: "Word" },
] as const;

const GAME_THEME = {
  emerald: { badge: "bg-emerald-500", progress: "bg-emerald-500" },
  blue: { badge: "bg-blue-500", progress: "bg-blue-500" },
  amber: { badge: "bg-amber-500", progress: "bg-amber-500" },
  rose: { badge: "bg-rose-500", progress: "bg-rose-500" },
} as const;

const GAME_ICON = {
  Speech: "S",
  Color: "C",
  Rhythm: "R",
  Word: "W",
} as const;

export default function GamesPage() {
  return (
    <ProtectedRoute requiredRole="caregiver">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Therapeutic Games</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage and monitor your child&apos;s therapeutic play activities.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl border-slate-200 px-6 font-bold">
              <DownloadIcon size={18} /> Library
            </Button>
            <Button variant="amber" className="gap-2 rounded-xl px-6 font-bold shadow-lg shadow-accent/20">
              <TrophyIcon size={18} /> Achievements
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((game) => (
            <div key={game.name} className="group rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-accent/20">
              <div className={cn("mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-3xl font-black text-white shadow-xl transition-transform group-hover:scale-110", GAME_THEME[game.tone].badge)}>
                {GAME_ICON[game.icon]}
              </div>
              <div className="mb-6 space-y-1 text-center">
                <h3 className="text-lg font-extrabold text-slate-900">{game.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{game.cat}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-slate-400">Mastery</span>
                    <span className="text-slate-900">{game.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-50">
                    <div className={cn("h-full transition-all duration-1000", GAME_THEME[game.tone].progress)} style={{ width: `${game.progress}%` }} />
                  </div>
                </div>
                <Button variant={game.progress > 0 ? "amber" : "outline"} className="w-full gap-2 rounded-2xl py-6 text-[10px] font-bold uppercase tracking-widest">
                  {game.progress > 0 ? <PlayIcon size={14} fill="currentColor" /> : <DownloadIcon size={14} />}
                  {game.progress > 0 ? "Continue" : "Download"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-10 rounded-[3rem] bg-slate-900 p-10 text-white md:flex-row">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} size={20} fill="currentColor" />
              ))}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">Unlock New Adventures</h2>
            <p className="max-w-lg text-lg font-medium text-slate-400">Complete weekly therapeutic goals to unlock exclusive new games designed by clinical specialists.</p>
            <Button variant="amber" className="h-14 rounded-2xl px-10 text-base font-bold shadow-2xl shadow-accent/20">
              View Milestone Map
            </Button>
          </div>
          <div className="flex h-64 w-64 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <TrophyIcon size={100} className="animate-bounce text-amber-400" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}