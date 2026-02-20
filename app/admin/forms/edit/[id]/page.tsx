"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import AdmissionForm from '@/Components/AdmissionForm'; // Path check kar lein

export default function EditStudentForm() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1. Purana Data Fetch Karein
    useEffect(() => {
        const getFormData = async () => {
            try {
                const res = await api.get(`/admin/forms/${id}`); // Backend route for single form
                setFormData(res.data.form || res.data);
            } catch (error) {
                console.error("Fetch Error:", error);
                alert("Data load karne mein masla hua!");
            } finally {
                setLoading(false);
            }
        };
        if (id) getFormData();
    }, [id]);

    // 2. Form Update Handle Karein
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put(`/admin/update-form/${id}`, formData);
            if (res.data.success) {
                alert("Record successfully update ho gaya!");
                router.push('/admin/dashboard'); // Wapis dashboard par
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("Update fail ho gaya!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all"
                    >
                        <ArrowLeft size={20} /> Wapis Jayein
                    </button>

                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>

                {/* Form Preview / Editor */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-4 md:p-10 border border-slate-100">
                    <div className="mb-8 border-b pb-4">
                        <h1 className="text-3xl font-black text-slate-800 italic uppercase">Edit <span className="text-blue-600">Student Record</span></h1>
                        <p className="text-slate-400 font-bold text-xs mt-1">Sary tabdeelyan dhyan se check kar lein.</p>
                    </div>

                    {/* Form Input Fields (Dynamic) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {Object.keys(formData).map((key) => {
                            // Kuch fields hide rakhni hain jo edit nahi honi
                            if (['_id', 'agentId', 'createdAt', '__v', 'formType'].includes(key)) return null;

                            return (
                                <div key={key} className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <input
                                        type="text"
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                            )
                        })}
                    </div>

                    <hr className="my-10 border-slate-100" />

                    {/* Live Preview of Admission Form */}
                    <div className="opacity-60 pointer-events-none scale-90">
                        <h3 className="text-center font-black text-slate-300 uppercase mb-4 tracking-[0.5em]">Live Preview</h3>
                        <AdmissionForm data={formData} type={formData.formType} />
                    </div>
                </div>
            </div>
        </div>
    );
}