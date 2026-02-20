"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
    UserPlus,
    ArrowLeft,
    Mail,
    User,
    BookOpen,
    ShieldCheck,
    Loader2
} from 'lucide-react';

export default function CreateTeacherPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure your backend has this route: POST /admin/teachers
            await api.post('/admin/teachers', formData);
            alert("Teacher account created successfully!");
            router.push('/admin/dashboard'); // Wapas dashboard bhejne ke liye
        } catch (error: any) {
            console.error("Creation Error:", error);
            alert(error.response?.data?.message || "Failed to create teacher account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
                                Add New <span className="text-blue-500 not-italic">Teacher</span>
                            </h1>
                            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Register a new faculty member</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                            <UserPlus size={32} className="text-blue-400" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter teacher name"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="teacher@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Login Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Specialization Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Specialization / Subject</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Web Development, Graphics"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>Create Teacher Account</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}