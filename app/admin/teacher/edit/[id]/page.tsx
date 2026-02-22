"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import {
    UserCog, ArrowLeft, Save, Loader2,
    Mail, User, Briefcase, PhoneCall,
    AlertCircle
} from 'lucide-react';

export default function EditTeacher() {
    const router = useRouter();
    const params = useParams();
    const id = params.id; // URL se ID uthayega

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialization: '',
        phone: '',
        department: ''
    });

    useEffect(() => {
        const fetchTeacher = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(false);

                // Backend call
                const res = await api.get(`/admin/teachers/${id}`);

                // Flexible data mapping (backend structure ke mutabiq)
                const data = res.data.teacher || res.data;

                if (data) {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        specialization: data.specialization || '',
                        phone: data.phone || '',
                        department: data.department || ''
                    });
                } else {
                    setError(true);
                }
            } catch (err: any) {
                console.error("Fetch error detail:", err);
                setError(true);
                toast.error("Teacher ka data load nahi ho saka");
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update call
            await api.put(`/admin/teachers/edit/${id}`, formData);
            toast.success("Profile successfully updated!");

            // Redirect to dashboard or list
            router.push('/admin/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Update failed!");
        } finally {
            setSaving(false);
        }
    };

    // 1. Loading State
    if (loading) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Accessing Database...</p>
        </div>
    );

    // 2. Error State (Agar ID galat ho ya data na mile)
    if (error) return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md">
                <AlertCircle size={60} className="text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Teacher Not Found</h2>
                <p className="text-slate-500 font-bold text-sm mb-8">Humein is ID ka koi record nahi mila. Shayad ye delete ho chuka hai.</p>
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all"
                >
                    Back to Safety
                </button>
            </div>
        </div>
    );

    // 3. Main Form UI
    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-16 text-slate-900">
            <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">

                {/* Visual Header */}
                <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Live Editor Mode</p>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-4">
                            <UserCog className="text-emerald-500" size={40} />
                            UPDATE <span className="text-emerald-500 not-italic">PROFILE</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="relative z-10 p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

                    {/* Full Name */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-5 flex items-center gap-2 tracking-widest">
                            <User size={14} className="text-emerald-500" /> Full Legal Name
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-50 outline-none font-bold text-slate-700 transition-all text-lg"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-5 flex items-center gap-2 tracking-widest">
                            <Mail size={14} className="text-emerald-500" /> Professional Email
                        </label>
                        <input
                            required
                            type="email"
                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-50 outline-none font-bold text-slate-700 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-5 flex items-center gap-2 tracking-widest">
                            <PhoneCall size={14} className="text-emerald-500" /> Contact Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-50 outline-none font-bold text-slate-700 transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {/* Specialization */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-5 flex items-center gap-2 tracking-widest">
                            <Briefcase size={14} className="text-emerald-500" /> Specialization
                        </label>
                        <input
                            type="text"
                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-50 outline-none font-bold text-slate-700 transition-all"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-5 flex items-center gap-2 tracking-widest">
                            <User size={14} className="text-emerald-500" /> Faculty Dept
                        </label>
                        <select
                            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:border-emerald-500 focus:bg-white focus:ring-4 ring-emerald-50 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="">Select Department</option>
                            <option value="CS">Computer Science</option>
                            <option value="EE">Electrical Engineering</option>
                            <option value="BBA">Business Admin</option>
                            <option value="HUM">Humanities</option>
                        </select>
                    </div>

                    {/* Submit Section */}
                    <div className="md:col-span-2 pt-10">
                        <button
                            disabled={saving}
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <Save size={24} className="group-hover:rotate-12 transition-transform" />
                                    Synchronize Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <p className="text-center mt-10 text-slate-300 font-black text-[9px] uppercase tracking-[0.5em]">
                Secure Academic Management System v4.0
            </p>
        </div>
    );
}