// "use client";

// import * as React from "react";
// import { Mail, ArrowLeft, MoveRight } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { AuthBackground } from "@/components/auth/AuthBackground";

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [email, setEmail] = React.useState("");
//   const [isLoading, setIsLoading] = React.useState(false);

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setTimeout(() => {
//       router.push("/check-email");
//     }, 1200);
//   };

//   return (
//     <AuthBackground>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//         className="relative grid w-full max-w-5xl grid-cols-1 lg:grid-cols-2"
//       >
//         <div className="relative hidden flex-col justify-around overflow-hidden p-8 lg:flex">
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
//               <h2 className="text-2xl font-extrabold leading-[1.1] tracking-tight text-primary">
//                 Secure <span className="text-emerald-600">Recovery</span> <br /> starts here.
//               </h2>
//               <div className="mt-3 h-1 w-16 rounded-full bg-emerald-500" />
//             </motion.div>
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.7 }}
//               className="max-w-sm text-sm font-medium leading-relaxed text-slate-600"
//             >
//               Lost your access? We&apos;ve got you covered with industrial-grade security protocols.
//             </motion.p>
//           </div>
//         </div>

//         <div className="relative flex flex-col justify-center p-6 lg:p-10">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
//             <Link
//               href="/login"
//               className="group absolute left-6 top-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-emerald-600 lg:left-10"
//             >
//               <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
//               Back to Login
//             </Link>
//           </motion.div>

//           <div className="mb-6 mt-8 text-center lg:text-left">
//             <motion.h3
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mb-1 text-2xl font-bold tracking-tight text-primary"
//             >
//               Reset Password
//             </motion.h3>
//             <motion.p
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.5 }}
//               className="text-sm font-medium text-slate-500"
//             >
//               Enter email to receive recovery instructions.
//             </motion.p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
//               <Input
//                 label="Registered Email"
//                 placeholder="Enter email address"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 icon={<Mail size={20} className="text-slate-400" />}
//                 className="h-11 rounded-xl border-slate-200/60 bg-white/50 font-medium transition-all focus:bg-white"
//                 required
//               />
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
//               <Button
//                 type="submit"
//                 variant="amber"
//                 className="group h-11 w-full border-none bg-emerald-600 text-base font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] rounded-xl"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
//                 ) : (
//                   <>
//                     Send Recovery Link
//                     <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
//                   </>
//                 )}
//               </Button>
//             </motion.div>

//             <p className="mt-4 text-center text-[10px] font-bold uppercase leading-relaxed tracking-tight text-slate-400">
//               Need help? <br />
//               <span className="cursor-pointer text-emerald-600 transition-all hover:text-emerald-700">Support Center</span>
//             </p>
//           </form>
//         </div>
//       </motion.div>
//     </AuthBackground>
//   );
// }
