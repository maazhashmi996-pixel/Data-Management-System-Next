"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, GraduationCap, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminCreateApplication() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        studentDetails: {
            firstName: '', lastName: '', passportNo: '', email: '', whatsapp: '',
            gender: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
            isAhmadi: 'No', previousVisaRefusal: 'No', handlerEmail: '', handlerContact: ''
        },
        courseDetails: {
            universityCountry: '', passportCountry: '', state: '', intake: '',
            university: '', courseName: '', courseType: 'Undergraduate'
        },
        adminControls: {
            commissionAmount: 0, initialStatus: 'Processing'
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) { setStep(2); return; }

        setLoading(true);
        try {
            await api.post('/study-abroad/submit', formData);
            alert("Application Created Successfully!");
            router.push('/admin/study-abroad');
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.message || "Check Console"}`);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "block w-full p-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 shadow-sm";
    const selectStyle = "block w-full p-4 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 shadow-sm cursor-pointer";

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-200">
                <div className="flex justify-between items-center border-b pb-4 mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Process Application</h1>
                    <span className="text-xs font-black bg-blue-100 text-blue-700 px-4 py-2 rounded-full">STEP {step} OF 2</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <section>
                                <h2 className="flex items-center gap-2 font-bold text-blue-700 mb-4 uppercase"><User size={18} /> Student Identity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required placeholder="Passport No *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, passportNo: e.target.value } })} />
                                    <input required placeholder="First Name *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, firstName: e.target.value } })} />
                                    <input placeholder="Last Name" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, lastName: e.target.value } })} />
                                    <input placeholder="Email ID *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, email: e.target.value } })} />
                                    <input placeholder="WhatsApp Number *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, whatsapp: e.target.value } })} />
                                    <select className={selectStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, gender: e.target.value } })}>
                                        <option value="">Select Gender *</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </section>

                            <section>
                                <h2 className="flex items-center gap-2 font-bold text-blue-700 mb-4 uppercase"><MapPin size={18} /> Location & Compliance</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="Address Line 1 *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, addressLine1: e.target.value } })} />
                                    <input placeholder="Address Line 2" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, addressLine2: e.target.value } })} />
                                    <input placeholder="City *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, city: e.target.value } })} />
                                    <input placeholder="State *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, state: e.target.value } })} />
                                    <input placeholder="Pincode *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, pincode: e.target.value } })} />
                                    <input placeholder="Handler Email *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, handlerEmail: e.target.value } })} />
                                    <input placeholder="Handler Contact *" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, handlerContact: e.target.value } })} />
                                    <div className="flex gap-4 items-center">
                                        <label className="text-sm font-bold text-slate-700">Ahmadiyya? *</label>
                                        <select onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, isAhmadi: e.target.value } })} className={selectStyle}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <section>
                                <h2 className="flex items-center gap-2 font-bold text-orange-600 mb-4 uppercase"><GraduationCap size={18} /> Course Assignment</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input placeholder="University Country *" className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, universityCountry: e.target.value } })} />
                                    <input placeholder="Passport Country *" className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, passportCountry: e.target.value } })} />
                                    <input placeholder="Intake *" className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, intake: e.target.value } })} />
                                    <input placeholder="University *" className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, university: e.target.value } })} />
                                    <input placeholder="Course Name *" className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, courseName: e.target.value } })} />
                                    <select className={selectStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, courseType: e.target.value } })}>
                                        <option value="Undergraduate">Undergraduate</option>
                                        <option value="Postgraduate">Postgraduate</option>
                                    </select>
                                </div>
                            </section>

                            <div className="bg-slate-800 p-6 rounded-2xl text-white">
                                <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs flex items-center gap-2"><ShieldCheck size={14} /> Admin Controls</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="number" placeholder="Commission (PKR)" className="w-full p-4 rounded-xl bg-slate-700 text-white placeholder-slate-300 border border-slate-600" onChange={e => setFormData({ ...formData, adminControls: { ...formData.adminControls, commissionAmount: Number(e.target.value) } })} />
                                    <select className="w-full p-4 rounded-xl bg-slate-700 text-white font-bold border border-slate-600" onChange={e => setFormData({ ...formData, adminControls: { ...formData.adminControls, initialStatus: e.target.value } })}>
                                        <option value="Processing">PROCESSING</option>
                                        <option value="In Review">IN REVIEW</option>
                                        <option value="Visa Issued">VISA ISSUED</option>
                                        <option value="Rejected">REJECTED</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-10">
                        {step === 2 && (
                            <button type="button" onClick={() => setStep(1)} className="px-8 py-5 rounded-2xl border-2 border-slate-300 font-black uppercase text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2">
                                <ArrowLeft size={18} /> BACK
                            </button>
                        )}
                        {/* Yahan button ka color blue-600 kar diya gaya hai */}
                        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl uppercase hover:bg-blue-800 transition-all shadow-xl flex items-center justify-center gap-2 border-2 border-blue-700">
                            {step === 1 ? <>CONTINUE <ArrowRight size={18} /></> : (loading ? "SUBMITTING..." : "COMPLETE REGISTRATION")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}