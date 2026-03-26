"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Globe, ArrowRight, CheckCircle2,
    MapPin, Phone, BookOpen, DollarSign,
    Users, Loader2
} from 'lucide-react';
import api from '@/lib/axios';

export default function ProcessApplication() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isExistingStudent, setIsExistingStudent] = useState(false);
    const [stats, setStats] = useState({ totalStudents: 0, totalCommission: 0 });

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
        handlerDetails: {
            handlerEmail: '', handlerContact: ''
        }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/agent/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    const handlePassportCheck = async (passportNo: string) => {
        if (passportNo.length < 4) return;
        try {
            const response = await api.get(`/study-abroad/check-student?passport=${passportNo}`);
            if (response.data.exists && response.data.student) {
                setFormData(prev => ({
                    ...prev,
                    studentDetails: { ...prev.studentDetails, ...response.data.student, passportNo }
                }));
                setIsExistingStudent(true);
            } else {
                setIsExistingStudent(false);
            }
        } catch (error) {
            console.error("Error checking passport:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/study-abroad/submit', formData);

            if (response.status === 200 || response.status === 201) {
                // Pehle hum window alert dikhayenge confirm karne ke liye
                alert("APPLICATION SUBMITTED SUCCESSFULLY! Redirecting to Dashboard...");

                // Dashboard par redirect - Aapka route '/agent' hai ya '/agent/dashboard' 
                // Summary ke mutabiq '/agent' main dashboard hai
                router.push('/agent/dashboard');

                // Optional: Refresh the page once arrived to ensure latest stats
                router.refresh();
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            alert(error.response?.data?.message || "Error submitting application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-bold text-sm shadow-sm";
    const labelStyle = "block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest";

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Form Section */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase">Process New Case</h1>
                            <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <Globe size={14} /> Global Admissions Department
                            </p>
                        </div>
                        {isExistingStudent && (
                            <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-green-500/30">
                                <CheckCircle2 size={14} /> Existing Student
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-12">
                        {/* Identity Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-600 pl-4">
                                <User className="text-blue-600" size={24} />
                                <h2 className="font-black text-slate-800 uppercase tracking-[0.15em] text-lg">Identity Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div><label className={labelStyle}>Passport No *</label><input required className={inputStyle} onBlur={(e) => handlePassportCheck(e.target.value)} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, passportNo: e.target.value } })} value={formData.studentDetails.passportNo || ''} /></div>
                                <div><label className={labelStyle}>First Name *</label><input required className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, firstName: e.target.value } })} value={formData.studentDetails.firstName || ''} /></div>
                                <div><label className={labelStyle}>Last Name</label><input className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, lastName: e.target.value } })} value={formData.studentDetails.lastName || ''} /></div>
                                <div><label className={labelStyle}>Email *</label><input required type="email" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, email: e.target.value } })} value={formData.studentDetails.email || ''} /></div>
                                <div><label className={labelStyle}>Visa Refusal History *</label><input required type="text" className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, previousVisaRefusal: e.target.value } })} value={formData.studentDetails.previousVisaRefusal || ''} /></div>
                                <div><label className={labelStyle}>WhatsApp *</label><input required className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, whatsapp: e.target.value } })} value={formData.studentDetails.whatsapp || ''} /></div>
                                <div><label className={labelStyle}>Gender</label><select className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, gender: e.target.value } })} value={formData.studentDetails.gender || ''}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-8 border-l-4 border-purple-600 pl-4">
                                <MapPin className="text-purple-600" size={24} />
                                <h2 className="font-black text-slate-800 uppercase tracking-[0.15em] text-lg">Location Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-3"><label className={labelStyle}>Address Line 1</label><input className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, addressLine1: e.target.value } })} value={formData.studentDetails.addressLine1 || ''} /></div>
                                <div><label className={labelStyle}>City</label><input className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, city: e.target.value } })} value={formData.studentDetails.city || ''} /></div>
                                <div><label className={labelStyle}>State</label><input className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, state: e.target.value } })} value={formData.studentDetails.state || ''} /></div>
                                <div><label className={labelStyle}>Pincode</label><input className={inputStyle} onChange={e => setFormData({ ...formData, studentDetails: { ...formData.studentDetails, pincode: e.target.value } })} value={formData.studentDetails.pincode || ''} /></div>
                                <div><label className={labelStyle}>Applying Country</label><input className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, universityCountry: e.target.value } })} value={formData.courseDetails.universityCountry || ''} /></div>
                            </div>
                        </div>

                        {/* Course & Handler Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <div className="flex items-center gap-3 mb-8 border-l-4 border-orange-600 pl-4">
                                    <BookOpen className="text-orange-600" size={24} />
                                    <h2 className="font-black text-slate-800 uppercase tracking-[0.15em] text-lg">Course Assignment</h2>
                                </div>
                                <div className="space-y-6">
                                    <input placeholder="Intake *" required className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, intake: e.target.value } })} value={formData.courseDetails.intake || ''} />
                                    <input placeholder="University *" required className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, university: e.target.value } })} value={formData.courseDetails.university || ''} />
                                    <input placeholder="Course Name *" required className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, courseName: e.target.value } })} value={formData.courseDetails.courseName || ''} />
                                    <input placeholder="Course Type *" required className={inputStyle} onChange={e => setFormData({ ...formData, courseDetails: { ...formData.courseDetails, courseType: e.target.value } })} value={formData.courseDetails.courseType || ''} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-600 pl-4">
                                    <Phone className="text-emerald-600" size={24} />
                                    <h2 className="font-black text-slate-800 uppercase tracking-[0.15em] text-lg">Handler Info</h2>
                                </div>
                                <div className="space-y-6">
                                    <input placeholder="Handler Email *" required className={inputStyle} onChange={e => setFormData({ ...formData, handlerDetails: { ...formData.handlerDetails, handlerEmail: e.target.value } })} value={formData.handlerDetails.handlerEmail || ''} />
                                    <input placeholder="Handler Contact *" required className={inputStyle} onChange={e => setFormData({ ...formData, handlerDetails: { ...formData.handlerDetails, handlerContact: e.target.value } })} value={formData.handlerDetails.handlerContact || ''} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-[0.4em] text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    PROCESSING CASE...
                                </>
                            ) : "FINALIZE REGISTRATION"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}