"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, setStoredAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    rollNumberOrEmail: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.rollNumberOrEmail.trim()) {
      newErrors.rollNumberOrEmail = "AKTU Roll Number or University Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError("");
    setSuccessMessage(false);

    try {
      const res = await api.login({
        rollNumberOrEmail: formData.rollNumberOrEmail,
        password: formData.password,
      });

      if (res.token) {
        setStoredAuth(res.token, res.student);
        setSuccessMessage(true);
        setTimeout(() => {
          router.push("/chat");
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials or server status.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101b] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-28 relative">
        {/* Background glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          
          {/* Card Container */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl shadow-blue-950/40">
            
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-[1px] mx-auto shadow-lg shadow-blue-500/20 mb-3">
                <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-sky-400" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Student Sign In
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Access your personalized AKTU AI Chatbot and pinned syllabus resources
              </p>
            </div>

            {/* API Error state banner */}
            {apiError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Authentication Failed</p>
                  <p className="text-slate-300 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* Success state banner */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-200">Sign In Successful!</p>
                  <p className="text-slate-300 mt-0.5">
                    Redirecting to your student AI assistant dashboard...
                  </p>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                  >
                    Open AI Chatbot Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Roll Number or Email Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  AKTU Roll No. or Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.rollNumberOrEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, rollNumberOrEmail: e.target.value });
                      if (errors.rollNumberOrEmail) setErrors({ ...errors, rollNumberOrEmail: "" });
                    }}
                    placeholder="e.g. 2100970100045 or student@aktu.ac.in"
                    className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.rollNumberOrEmail
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.rollNumberOrEmail && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.rollNumberOrEmail}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your password"
                    className={`w-full bg-slate-900/90 border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      errors.password
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs text-slate-300">Keep me logged in on this device</span>
                </label>
              </div>

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Quick Demo Autofill Notice */}
            <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Demo Access (UI mock):</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    rollNumberOrEmail: "2100970100045",
                    password: "aktuPassword123",
                    rememberMe: true,
                  });
                  setErrors({});
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
              >
                Fill Mock Details
              </button>
            </div>

            {/* Link to Signup */}
            <p className="mt-6 text-center text-xs text-slate-400">
              Not yet registered on the AI portal?{" "}
              <Link href="/signup" className="text-sky-400 font-semibold hover:underline">
                Create Free Account
              </Link>
            </p>

          </div>

          {/* ERP Notice */}
          <p className="text-center text-[11px] text-slate-400 mt-4">
            Dr. A.P.J. Abdul Kalam Technical University, Lucknow • Student AI Support
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
