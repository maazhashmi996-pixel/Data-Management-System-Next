"use client";
import { useState } from 'react';
import api from '@/lib/axios';
import { ShieldAlert, Lock, Mail, User, ArrowRight, Loader2, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', secretKey: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // CENTRAL API Call - Path as per your backend
            const res = await api.post('/admin/setup-root', formData);
            alert("✅ Root Admin Created Successfully!");
            router.push('/login');
        } catch (err: any) {
            console.error("Setup Error:", err);
            alert(err.response?.data?.message || "Setup failed. Maybe admin already exists?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans selection:bg-blue-500/30">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200">

                    {/* Header: Identity & Branding */}
                    <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <Cpu className="w-64 h-64 -translate-x-1/2 -translate-y-1/2 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 rotate-12">
                                <ShieldAlert className="text-white w-12 h-12" />
                            </div>
                            <h1 className="text-2xl font-[900] text-white tracking-tighter uppercase">System Init</h1>
                            <p className="text-slate-400 text-[10px] mt-2 font-black tracking-[0.2em] uppercase opacity-80">
                                Master Account Deployment
                            </p>
                        </div>
                    </div>

                    {/* Form Area */}
                    <form onSubmit={handleSetup} className="p-8 md:p-10 space-y-6">

                        <div className="grid grid-cols-1 gap-5">
                            {/* Master Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Master Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        required
                                        placeholder="Super Admin"
                                        className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold transition-all"
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Admin Email */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Root Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="admin@system.com"
                                        className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold transition-all"
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Security Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 font-bold transition-all"
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Secret Setup Key */}
                            <div className="pt-2">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1 block mb-2">System Secret Key</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="Enter Backend Secret"
                                    className="w-full border-2 border-dashed border-red-100 bg-red-50/30 p-4 rounded-2xl focus:border-red-500 focus:bg-white outline-none text-slate-800 font-mono transition-all placeholder:font-sans placeholder:font-medium"
                                    onChange={e => setFormData({ ...formData, secretKey: e.target.value })}
                                />
                                <div className="flex items-center gap-2 mt-3 ml-1">
                                    <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight italic">Matches ENV Security Protocol</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xs tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 hover:shadow-slate-200 active:scale-95 disabled:opacity-70 uppercase group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Initialize Core
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Bottom Footer Info */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        Hardware ID: 0x4F22-B90L-88X
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="h-1 w-8 bg-blue-600/30 rounded-full" />
                        <div className="h-1 w-8 bg-blue-600/30 rounded-full" />
                        <div className="h-1 w-8 bg-blue-600/30 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}