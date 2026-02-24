"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // 1. Auth Guard: Agar user pehle se login hai to usey wapas dashboard bhej do
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role')?.toLowerCase();
        if (token && role) {
            router.replace(`/${role}/dashboard`);
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // CENTRAL API Call
            const res = await api.post('/auth/login', { email, password });

            // 2. Data Persistence (Token aur User info save karna)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            const userRole = res.data.user.role.toLowerCase();
            localStorage.setItem('role', userRole);

            // 3. Dynamic Role Based Navigation
            const dashboardPaths: Record<string, string> = {
                admin: '/admin/dashboard',
                agent: '/agent/dashboard',
                teacher: '/teacher/dashboard'
            };

            const targetPath = dashboardPaths[userRole] || '/';

            // Success animation ke liye chhota sa delay (Optional but feels premium)
            router.replace(targetPath);

        } catch (err: any) {
            console.error("Login Error:", err);
            alert(err.response?.data?.message || "Login Failed! Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfeff] p-4 font-sans selection:bg-blue-100">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                {/* Main Login Card */}
                <div className="bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-slate-100">
                    <div className="p-8 md:p-12">

                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200 transition-transform hover:scale-105 active:scale-95 duration-300">
                                <ShieldCheck className="text-white w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter uppercase leading-none">
                                CRM LOGIN
                            </h2>
                            <p className="text-slate-400 text-[10px] mt-3 font-bold tracking-[0.3em] uppercase opacity-70">
                                Secure Enterprise Access
                            </p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-bold placeholder:text-slate-300 placeholder:font-medium"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-bold placeholder:text-slate-300"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-xs tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-80 uppercase group overflow-hidden relative"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Setup Section - PATH FIXED */}
                        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                            <p className="text-slate-400 text-[9px] mb-4 uppercase tracking-[0.2em] font-black opacity-50">
                                First time here? Contact System Admin
                            </p>
                            <Link
                                href="/setup-root"
                                className="group inline-flex items-center gap-2 text-blue-600 font-black text-xs hover:text-blue-700 transition-all uppercase tracking-widest bg-blue-50/50 px-8 py-4 rounded-2xl border border-transparent hover:border-blue-100"
                            >
                                First Time Setup?
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <p className="text-center text-slate-300 text-[9px] mt-10 uppercase tracking-[0.4em] font-bold">
                    &copy; 2026 CRM Systems &bull; Enterprise Grade Security
                </p>
            </div>
        </div>
    );
}