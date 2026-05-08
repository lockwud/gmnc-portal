// "use client";

// import * as React from "react";
// import { MailCheck, RefreshCcw, ArrowLeft, Mail } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { AuthBackground } from "@/components/auth/AuthBackground";

// export default function CheckEmailPage() {
//   const router = useRouter();
//   const [email, setEmail] = React.useState("");
//   const [isLoading, setIsLoading] = React.useState(false);

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       router.push("/reset-password");
//     }, 1200);
//   };

//   return (
//     <AuthBackground>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//         className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden lg:grid-cols-2"
//       >
//         <div className="relative hidden flex-col justify-around overflow-hidden p-8 lg:flex">
//           <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />

//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative z-10 flex items-center gap-4"
//           >
//             <div className="h-14 w-14 rounded-2xl border border-white/60 bg-white p-2 shadow-sm">
//               <Image src="/logo.png" alt="GmNC Logo" width={40} height={40} className="h-full w-full object-contain" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight text-primary">GmNC</h1>
//               <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">getmyneurocare</p>
//             </div>
//           </motion.div>

//           <div className="relative z-10 space-y-8">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
//               <h2 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-primary">
//                 Simple <span className="text-emerald-600">Recovery</span>. <br /> Piece of mind.
//               </h2>
//               <div className="mt-6 h-1.5 w-20 rounded-full bg-emerald-500" />
//             </motion.div>
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.7 }}
//               className="max-w-sm text-lg font-medium leading-relaxed text-slate-600"
//             >
//               Getting back into your clinical dashboard is secure and straightforward.
//             </motion.p>
//           </div>
//         </div>

//         <div className="relative flex flex-col justify-center p-8 text-center lg:p-12 lg:text-left">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3 }}
//             className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/50 backdrop-blur-sm lg:mx-0"
//           >
//             <MailCheck className="h-8 w-8 text-emerald-500" />
//           </motion.div>

//           <motion.h3
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="mb-1 text-2xl font-bold tracking-tight text-primary"
//           >
//             Check Inbox
//           </motion.h3>
//           <motion.p
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.5 }}
//             className="mb-4 max-w-md text-sm font-medium leading-relaxed text-slate-500"
//           >
//             A secure recovery link has been sent. Click it to reset your access in seconds.
//           </motion.p>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="group relative">
//               <Input
//                 placeholder="Enter your email"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 icon={<Mail size={20} className="text-slate-400" />}
//                 className="h-11 rounded-xl border-slate-200/60 bg-white/50 font-medium transition-all focus:bg-white"
//               />
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-2">
//               <Button
//                 type="submit"
//                 variant="amber"
//                 className="group h-12 w-full rounded-xl border-none bg-emerald-600 text-lg font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
//                 ) : (
//                   <>
//                     Send Recovery Link
//                     <RefreshCcw size={18} className="ml-2 transition-transform duration-500 group-hover:rotate-180" />
//                   </>
//                 )}
//               </Button>

//               <Link href="/login" className="block">
//                 <Button type="button" variant="gray" className="h-11 w-full rounded-xl gap-2 font-bold text-slate-500 transition-all hover:bg-white/60">
//                   <ArrowLeft size={18} />
//                   Back to Login
//                 </Button>
//               </Link>
//             </motion.div>
//           </form>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.9 }}
//             className="mt-6 text-[10px] font-bold uppercase leading-relaxed tracking-tight text-slate-400"
//           >
//             No email? Check <span className="text-emerald-600">Spam</span> or <span className="cursor-pointer text-emerald-600 hover:underline">Contact Admin</span>
//           </motion.p>
//         </div>
//       </motion.div>
//     </AuthBackground>
//   );
// }
