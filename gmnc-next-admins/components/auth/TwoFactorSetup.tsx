"use client";

import * as React from "react";
import { Shield, Smartphone, Copy, Download, CheckCircle2, ArrowRight, ArrowLeft, QrCode } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export const TwoFactorSetup = () => {
  const router = useRouter();
  const [step, setStep] = React.useState(1); // 1: Info, 2: Scan, 3: Verify, 4: Backup Codes
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const backupCodes = [
    "A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6",
    "Q7R8-S9T0", "U1V2-W3X4", "Y5Z6-A7B8", "C9D0-E1F2"
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock verification
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification later
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "gmnc-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="w-full max-w-lg p-1 bg-white rounded-[32px] shadow-2xl shadow-emerald-500/10 border border-slate-100 overflow-hidden">
      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <Shield className="text-emerald-600 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Secure Your Account</h3>
              <p className="text-slate-500 font-medium mb-8">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <div className="space-y-4 text-left mb-8">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Smartphone className="text-emerald-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Authenticator App</h4>
                    <p className="text-slate-500 text-xs font-medium">Use apps like Google Authenticator or Microsoft Authenticator.</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20 group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-center gap-2">
                <QrCode size={24} className="text-emerald-500" />
                Scan QR Code
              </h3>
              <div className="w-48 h-48 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-200">
                {/* QR Code Placeholder */}
                <div className="w-40 h-40 bg-slate-900 rounded-2xl flex items-center justify-center">
                   <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-50">QR Code</span>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Secret Key</p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <code className="text-slate-900 font-mono font-bold text-sm">JBSWY3DPEHPK3PXP</code>
                  <button onClick={() => copyToClipboard("JBSWY3DPEHPK3PXP")} className="text-emerald-600 hover:text-emerald-700 p-1">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="gray" onClick={() => setStep(1)} className="flex-1 h-12 rounded-2xl font-bold border border-slate-100">
                   Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-[2] h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  Next Step
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Verify Setup</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Enter the 6-digit code from your app.</p>
              
              <form onSubmit={handleVerify} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button variant="gray" onClick={() => setStep(2)} className="flex-1 h-12 rounded-2xl font-bold border border-slate-100">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2] h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Confirm & Enable"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2FA Enabled Successfully!</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Save these backup codes in a secure place. They can be used to access your account if you lose your device.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {backupCodes.map((code, i) => (
                  <div key={i} className="text-xs font-mono font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex justify-between group">
                    {code}
                    <button onClick={() => copyToClipboard(code)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy size={12} className="text-emerald-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Button
                  variant="gray"
                  onClick={downloadBackupCodes}
                  className="w-full h-12 rounded-2xl font-bold border border-slate-200 gap-2"
                >
                  <Download size={18} />
                  Download Codes (.txt)
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20"
                >
                  Done, Take me Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
