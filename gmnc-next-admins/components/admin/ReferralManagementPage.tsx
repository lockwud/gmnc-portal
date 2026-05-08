// "use client";

// import React from "react";
// import { Table } from "@/components/ui/Table";
// import Button from "@/components/ui/Button";
// import { UsersIcon, GiftIcon, TrendingUpIcon, MegaphoneIcon, Share2Icon } from "lucide-react";
// import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// import { OryxStatCard } from "@/components/ui/OryxStatCard";

// const MOCK_CAMPAIGNS = [
//   { id: 1, name: "Summer Referral 2025", status: "Active", clicks: 2450, signups: 124, rewardsPaid: "GH₵ 12,400" },
//   { id: 2, name: "Provider Network Growth", status: "Active", clicks: 890, signups: 42, rewardsPaid: "GH₵ 8,400" },
//   { id: 3, name: "Alpha Launch Program", status: "Completed", clicks: 500, signups: 10, rewardsPaid: "GH₵ 1,000" },
// ];

// export default function ReferralManagementPage() {
//   return (
//     <ProtectedRoute requiredRole="admin">
//       <div className="space-y-8 pb-10">
//         <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Referral Campaigns</h1>
//             <p className="mt-1 text-xs font-bold text-slate-400">Monitor and manage referral programs and rewards.</p>
//           </div>
//           <Button variant="amber" className="gap-2 rounded-xl px-6 font-bold shadow-lg shadow-accent/20">
//             <MegaphoneIcon size={18} /> Launch Campaign
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//           <OryxStatCard
//             title="Total Referrals"
//             value="176"
//             icon={<UsersIcon size={20} className="text-blue-500" />}
//             subMetrics={[{ label: "Conversion", value: "5.1%", color: "emerald" }]}
//           />
//           <OryxStatCard
//             title="Rewards Issued"
//             value="GH₵ 21,800"
//             icon={<GiftIcon size={20} className="text-amber-500" />}
//             subMetrics={[{ label: "Pending", value: "GH₵ 2,400", color: "amber" }]}
//           />
//           <OryxStatCard
//             title="Growth Rate"
//             value="+12.4%"
//             icon={<TrendingUpIcon size={20} className="text-emerald-500" />}
//             subMetrics={[{ label: "Target", value: "15%", color: "slate" }]}
//           />
//         </div>

//         <Table
//           title="Active Campaigns"
//           data={MOCK_CAMPAIGNS}
//           columns={[
//             { header: "Campaign Name", accessor: "name", className: "font-extrabold text-slate-900" },
//             {
//               header: "Status",
//               accessor: (item: { status: string }) => (
//                 <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
//                   {item.status}
//                 </span>
//               ),
//             },
//             { header: "Clicks", accessor: "clicks", className: "font-mono text-xs text-slate-500" },
//             { header: "New Signups", accessor: "signups", className: "font-bold text-primary" },
//             { header: "Rewards Paid", accessor: "rewardsPaid", className: "font-bold text-emerald-600" },
//           ]}
//           actions={() => (
//             <button aria-label="Share referral campaign" className="p-2 text-slate-300 transition-all hover:text-accent">
//               <Share2Icon size={18} />
//             </button>
//           )}
//         />
//       </div>
//     </ProtectedRoute>
//   );
// }
