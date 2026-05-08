// "use client";

// import * as React from "react";
// import { Lock, Eye, EyeOff, CheckCircle2, MoveRight } from "lucide-react";
// import Button from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { AuthBackground } from "@/components/auth/AuthBackground";

// export default function ResetPasswordPage() {
//   const router = useRouter();
//   const [password, setPassword] = React.useState("");
//   const [confirmPassword, setConfirmPassword] = React.useState("");
//   const [showPassword, setShowPassword] = React.useState(false);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [isSuccess, setIsSuccess] = React.useState(false);

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       setIsSuccess(true);
//       setTimeout(() => {
//         router.push("/login");
//       }, 2000);
//     }, 1200);
//   };

//   if (isSuccess) {
//     return (
//       <AuthBackground>
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ type: "spring", stiffness: 100, damping: 20 }}
//           className="relative w-full max-w-md overflow-hidden rounded-[3rem] border border-white/40 p-10 text-center shadow-premium glass"
//         >
//           <div className="absolute left-0 top-0 -ml-16 -mt-16 h-32 w-32 rounded-full bg-emerald-200/20 blur-2xl" />

//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3 }}
//             className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/60 bg-white/50 shadow-sm backdrop-blur-sm"
//           >
//             <CheckCircle2 className="h-8 w-8 text-emerald-500" />
//           </motion.div>

//           <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-1 text-2xl font-bold tracking-tight text-primary">
//             Password Updated!
//           </motion.h3>
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="mb-8 text-xs font-medium leading-relaxed text-slate-500"
//           >
//             Your credentials have been reset. <br /> Redirecting you to login...
//           </motion.p>

//           <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100/50">
//             <motion.div
//               initial={{ width: "0%" }}
//               animate={{ width: "100%" }}
//               transition={{ duration: 2 }}
//               className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
//             />
//           </div>
//         </motion.div>
//       </AuthBackground>
//     );
//   }

//   return (
//     <AuthBackground>
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//         className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden lg:grid-cols-2"
//       >
//         <div className="relative hidden flex-col justify-around overflow-hidden p-10 lg:flex">
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
//               <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-primary">
//                 Access <span className="text-emerald-600">Regained</span>. <br /> Security first.
//               </h2>
//               <div className="mt-4 h-1.5 w-20 rounded-full bg-emerald-500" />
//             </motion.div>
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.7 }}
//               className="max-w-sm text-base font-medium leading-relaxed text-slate-600"
//             >
//               Set your new credentials and get back to managing what matters most.
//             </motion.p>
//           </div>
//         </div>

//         <div className="relative flex flex-col justify-center p-6 lg:p-10">
//           <div className="mb-6 text-center lg:text-left">
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
//               Choose a strong, unique password.
//             </motion.p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-3">
//               <div className="relative">
//                 <Input
//                   label="New Password"
//                   placeholder="Enter new password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(event) => setPassword(event.target.value)}
//                   icon={<Lock size={20} className="text-slate-400" />}
//                   className="h-11 rounded-xl border-slate-200/60 bg-white/50 font-medium transition-all focus:bg-white"
//                   required
//                 />
//                 <button
//                   type="button"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   onClick={() => setShowPassword((current) => !current)}
//                   className="absolute right-4 top-[38px] text-slate-400 transition-colors hover:text-emerald-500"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>

//               <Input
//                 label="Confirm Password"
//                 placeholder="Confirm your new password"
//                 type={showPassword ? "text" : "password"}
//                 value={confirmPassword}
//                 onChange={(event) => setConfirmPassword(event.target.value)}
//                 icon={<Lock size={20} className="text-slate-400" />}
//                 className="h-11 rounded-xl border-slate-200/60 bg-white/50 font-medium transition-all focus:bg-white"
//                 required
//               />
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
//               <Button
//                 type="submit"
//                 variant="amber"
//                 className="group h-12 w-full rounded-xl border-none bg-emerald-600 text-lg font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
//                 disabled={isLoading || password !== confirmPassword || password.length < 6}
//               >
//                 {isLoading ? (
//                   <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
//                 ) : (
//                   <>
//                     Complete Reset
//                     <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
//                   </>
//                 )}
//               </Button>
//             </motion.div>
//           </form>
//         </div>
//       </motion.div>
//     </AuthBackground>
//   );
// }
