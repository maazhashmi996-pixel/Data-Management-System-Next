"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { UserCog, ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditAgent() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.get(`/admin/agents/${id}`);
                setFormData({ name: res.data.agent.name, email: res.data.agent.email });
            } catch (error) {
                toast.error("Agent data load nahi ho saka");
            } finally {
                setLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/agents/edit/${id}`, formData);
            toast.success("Agent updated successfully");
            router.push('/admin/dashboard'); // Wapis dashboard par
        } catch (error) {
            toast.error("Update failed!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-300">LOADING AGENT...</div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-20">
            <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Control Panel</p>
                        <h1 className="text-3xl font-black italic flex items-center gap-3">
                            <UserCog /> EDIT AGENT
                        </h1>
                    </div>
                    <button onClick={() => router.back()} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Full Name</label>
                        <input
                            required
                            type="text"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <button
                        disabled={saving}
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SAVE CHANGES</>}
                    </button>
                </form>
            </div>
        </div>
    );
}