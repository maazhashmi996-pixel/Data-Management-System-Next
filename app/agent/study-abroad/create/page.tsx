"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Globe, GraduationCap, ArrowRight } from 'lucide-react';

export default function ProcessApplication() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isExistingStudent, setIsExistingStudent] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Student Info
        studentFirstName: '',
        studentLastName: '',
        passportCountry: '',
        studentPassportNo: '',
        studentEmail: '',
        studentWhatsapp: '',
        state: '',
        pincode: '',
        city: '',
        addressLine1: '',
        addressLine2: '',
        previousVisaRefusal: '',
        gender: '',
        ahmadiyyaReligion: '',

        // Handling Person Info
        handlerEmail: '',
        handlerContact: '',

        // Course Info (Application specific)
        universityCountry: '',
        intake: '',
        courseType: '',
        university: '',
        courseName: ''
    });

    // Passport Number Check Logic
    const handlePassportCheck = async (passportNo: string) => {
        if (passportNo.length < 5) return;

        try {
            // Yahan aapka API call hoga: fetch(`/api/students/check?passport=${passportNo}`)
            // Demo logic:
            const response = await fetch(`/api/study-abroad/check-student?passport=${passportNo}`);
            const data = await response.json();

            if (data.exists) {
                setFormData({ ...formData, ...data.student, studentPassportNo: passportNo });
                setIsExistingStudent(true);
            } else {
                setIsExistingStudent(false);
            }
        } catch (error) {
            console.error("Error fetching student:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/study-abroad/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Application Submitted Successfully!");
                router.push('/agent/study-abroad');
            }
        } catch (error) {
            alert("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700";
    const labelStyle = "block text-xs font-bold text-slate-500 uppercase mb-1 ml-1";

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                {/* Header */}
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Process Application</h1>
                        <p className="text-slate-400 text-sm">Anglia Ruskin University | MA Applied Linguistics</p>
                    </div>
                    <div className="bg-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                        New Enrollment
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* SECTION 1: Personal Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-100">
                            <User className="text-blue-600" size={20} />
                            <h2 className="font-black text-slate-800 uppercase tracking-wider">Student Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelStyle}>Student Passport No *</label>
                                <input
                                    type="text"
                                    required
                                    className={`${inputStyle} border-blue-200 bg-blue-50/30`}
                                    placeholder="Enter Passport No"
                                    onBlur={(e) => handlePassportCheck(e.target.value)}
                                    onChange={(e) => setFormData({ ...formData, studentPassportNo: e.target.value })}
                                />
                                {isExistingStudent && <p className="text-[10px] text-green-600 font-bold mt-1 uppercase">✓ Existing Student Found</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>First Name *</label>
                                <input type="text" required className={inputStyle} value={formData.studentFirstName} onChange={(e) => setFormData({ ...formData, studentFirstName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>Last Name *</label>
                                <input type="text" required className={inputStyle} value={formData.studentLastName} onChange={(e) => setFormData({ ...formData, studentLastName: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <label className={labelStyle}>Passport Country *</label>
                                <input type="text" required className={inputStyle} value={formData.passportCountry} onChange={(e) => setFormData({ ...formData, passportCountry: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>Student Email ID *</label>
                                <input type="email" required className={inputStyle} value={formData.studentEmail} onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>Whatsapp Number *</label>
                                <input type="text" required className={inputStyle} value={formData.studentWhatsapp} onChange={(e) => setFormData({ ...formData, studentWhatsapp: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                            <div><label className={labelStyle}>State</label><input type="text" className={inputStyle} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div>
                            <div><label className={labelStyle}>City</label><input type="text" className={inputStyle} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                            <div><label className={labelStyle}>Pincode</label><input type="text" className={inputStyle} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} /></div>
                            <div><label className={labelStyle}>Gender</label><input type="text" className={inputStyle} value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* SECTION 2: Course Application */}
                    <div className="pt-6">
                        <div className="flex items-center gap-2 mb-6 border-b pb-2 border-slate-100">
                            <Globe className="text-blue-600" size={20} />
                            <h2 className="font-black text-slate-800 uppercase tracking-wider">Application Details (New Course)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelStyle}>University Country *</label>
                                <input type="text" required className={inputStyle} placeholder="e.g. United Kingdom" onChange={(e) => setFormData({ ...formData, universityCountry: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>Intake *</label>
                                <input type="text" required className={inputStyle} placeholder="e.g. Sep/Oct 2026" onChange={(e) => setFormData({ ...formData, intake: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>University Name *</label>
                                <input type="text" required className={inputStyle} onChange={(e) => setFormData({ ...formData, university: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelStyle}>Course Name *</label>
                                <input type="text" required className={inputStyle} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-10 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-orange-600/20 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {loading ? "Processing..." : (
                                <>
                                    Confirm & Submit Application
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}