"use client";

import * as React from "react";
import { BookOpen, Video, FileText, Download, Search, ChevronRight, PlayCircle, ExternalLink, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const RESOURCES = [
  { id: 1, title: 'Understanding Chronic Migraines', category: 'Articles', type: 'text', readTime: '5 min', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, title: 'Managing Epilepsy in Children', category: 'Guides', type: 'pdf', size: '2.4 MB', color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 3, title: 'Telehealth: What to Expect', category: 'Tutorials', type: 'video', duration: '12:40', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 4, title: 'Nutrition for Brain Health', category: 'Articles', type: 'text', readTime: '8 min', color: 'text-amber-500', bg: 'bg-amber-50' },
];

export function ResourceCenter() {
  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative h-[320px] rounded-[48px] bg-slate-900 overflow-hidden flex items-center px-12">
         <div className="absolute inset-0 opacity-20 bg-noise" />
         <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
         
         <div className="relative z-10 max-w-2xl space-y-6">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">Knowledge Base</Badge>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
               Empowering your <span className="text-emerald-400">Caregiving</span> Journey.
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
               Access certified medical resources, tutorials, and guides to provide better support for your loved ones.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Main Feed */}
         <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Resources</h3>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toast.success('Reading list updated')}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                     <Bookmark size={20} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {RESOURCES.map((res) => (
                 <div 
                   key={res.id} 
                   onClick={() => toast.success(`Opening resource: ${res.title}`)}
                   className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-500/5 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[260px]"
                 >
                    <div>
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", res.bg, res.color)}>
                          {res.type === 'video' ? <PlayCircle size={24} /> : res.type === 'pdf' ? <Download size={24} /> : <BookOpen size={24} />}
                       </div>
                       <Badge color="gray" className="mb-3 font-bold border-slate-100 text-[9px] uppercase tracking-widest text-slate-400">{res.category}</Badge>
                       <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{res.title}</h4>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                       <span>{res.readTime || res.duration || res.size}</span>
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Sidebar Tools */}
         <div className="space-y-8">
            <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100">
               <h3 className="text-lg font-black text-emerald-900 mb-6 flex items-center gap-2">
                  <Search size={20} className="text-emerald-500" />
                  Quick Search
               </h3>
               <div className="space-y-4">
                  <Input placeholder="Search topics..." className="bg-white border-none h-12 rounded-2xl shadow-sm" />
                  <div className="flex flex-wrap gap-2 pt-2">
                     {['Anxiety', 'Medication', 'Safety', 'Nutrition', 'Rehab'].map(tag => (
                        <Badge 
                         key={tag} 
                         onClick={() => toast.success(`Filtering by tag: #${tag}`)}
                         className="bg-white text-emerald-700 border-none font-bold px-3 py-1.5 cursor-pointer hover:bg-emerald-600 hover:text-white transition-all"
                        >
                           #{tag}
                        </Badge>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Video size={18} className="text-rose-500" />
                  Featured Workshop
               </h3>
               <div className="aspect-video rounded-3xl bg-slate-100 relative overflow-hidden group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-500" alt="Workshop" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                     <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-transform">
                        <PlayCircle size={32} />
                     </div>
                  </div>
               </div>
               <p className="text-xs font-bold text-slate-900">Effective Communication with Neurological Patients</p>
               <Button 
                 variant="gray" 
                 className="w-full h-10 rounded-xl border border-slate-100 text-xs font-bold gap-2"
                 onClick={() => toast.success('Joining featured workshop...')}
               >
                  <ExternalLink size={14} />
                  Join Next Session
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
