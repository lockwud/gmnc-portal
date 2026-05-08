// "use client";

// import * as React from "react";
// import { ShieldCheck, RefreshCcw, MoveRight } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { AuthBackground } from "@/components/auth/AuthBackground";
// import { useAuth } from "@/lib/context/AuthContext";
// import { getDashboardRoute } from "@/lib/rbac";

// export default function OTPPage() {
//   const router = useRouter();
//   const { selectedRole } = useAuth();
//   const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

//   const handleChange = (element: HTMLInputElement, index: number) => {
//     if (Number.isNaN(Number(element.value))) {
//       return false;
//     }

//     setOtp((current) => current.map((digit, currentIndex) => (currentIndex === index ? element.value : digit)));

//     if (element.value !== "" && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }

//     return true;
//   };

//   const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
//     if (event.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     setIsLoading(true);
//     setTimeout(() => {
//       if (selectedRole) {
//         router.push(getDashboardRoute(selectedRole));
//         return;
//       }

//       router.push("/dashboard");
//     }, 1200);
//   };

//   return (
//     <AuthBackground>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//         className="relative w-full max-w-md overflow-hidden rounded border border-slate-200 p-8 text-center backdrop-blur-md"
//       >
//         <div className="absolute left-0 top-0 -ml-16 -mt-16 h-32 w-32 bg-emerald-200/20 blur-2xl" />

//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/50 shadow-sm backdrop-blur-sm"
//         >
//           <ShieldCheck className="h-7 w-7 text-emerald-500" />
//         </motion.div>

//         <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-3 text-3xl font-bold tracking-tight text-primary">
//           Verify Account
//         </motion.h3>
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="mb-6 text-xs font-medium leading-relaxed text-slate-500"
//         >
//           A 6-digit code was sent to your email. <br /> Please enter it below to continue.
//         </motion.p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex justify-between gap-2">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 maxLength={1}
//                 aria-label={`OTP digit ${index + 1}`}
//                 ref={(element) => {
//                   inputRefs.current[index] = element;
//                 }}
//                 value={digit}
//                 onChange={(event) => {
//                   handleChange(event.target, index);
//                 }}
//                 onKeyDown={(event) => handleKeyDown(event, index)}
//                 className="h-12 w-10 rounded-xl border border-slate-200/60 bg-white/50 text-center text-lg font-bold text-primary shadow-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
//               />
//             ))}
//           </motion.div>

//           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-4">
//             <Button
//               type="submit"
//               variant="amber"
//               className="group h-11 w-full rounded-xl border-none bg-emerald-600 text-base font-bold text-white shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
//               disabled={isLoading || otp.join("").length < 6}
//             >
//               {isLoading ? (
//                 <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
//               ) : (
//                 <>
//                   Verify Access
//                   <MoveRight className="ml-2 transition-transform group-hover:translate-x-1" />
//                 </>
//               )}
//             </Button>

//             <button
//               type="button"
//               onClick={() => {
//                 setIsLoading(true);
//                 setTimeout(() => {
//                   setIsLoading(false);
//                   alert("A new OTP code has been sent!");
//                 }, 1000);
//               }}
//               className="group mx-auto flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-emerald-600"
//             >
//               <RefreshCcw size={16} className="transition-transform duration-500 group-hover:rotate-180" />
//               Resend Code
//             </button>
//           </motion.div>
//         </form>
//       </motion.div>
//     </AuthBackground>
//   );
// }