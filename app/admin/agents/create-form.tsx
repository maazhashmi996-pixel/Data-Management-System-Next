"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Save, GraduationCap, User, Phone, MapPin, BookOpen } from 'lucide-react';

// Form Content Component (to handle useSearchParams safely)
function FormContent() {
    const searchParams = useSearchParams();
    const formType = searchParams.get('type') || 'Education Zone';
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        studentName: '',
        fatherName: '',
        cnic: '',
        mobileNo: '',
        address: '',
        email: '',
        course: '',
        duration: '',
        marks: '',
        year: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // Note: Make sure your backend endpoint is correct
            await axios.post('http://localhost:5000/api/agent/submit', {
                ...formData,
                formType,
                qualification: { marks: formData.marks, year: formData.year }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Form Submitted Successfully!");
            router.push('/agent/dashboard');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Submission failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
            {/* Header Section */}
            <div className={`p-8 text-white flex justify-between items-center ${formType.includes('Zone') ? 'bg-orange-500' : 'bg-blue-600'}`}>
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">{formType}</h2>
                    <p className="opacity-90 font-medium">New Student Admission Enrollment</p>
                </div>
                <button onClick={() => router.back()} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                    <ArrowLeft size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- Student Information --- */}
                <div className="md:col-span-2 flex items-center gap-2 border-b pb-2 mb-2">
                    <User size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Personal Details</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Student Full Name</label>
                    <input required className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        type="text" placeholder="Enter Full Name"
                        onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Father's Name</label>
                    <input required className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        type="text" placeholder="Enter Father's Name"
                        onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">CNIC / B-Form Number</label>
                    <input className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        type="text" placeholder="35201-XXXXXXX-X"
                        onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Mobile Number</label>
                    <input required className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        type="text" placeholder="03XXXXXXXXX"
                        onChange={e => setFormData({ ...formData, mobileNo: e.target.value })} />
                </div>

                <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Home Address</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                        <input required className="w-full bg-slate-50 border-none p-3.5 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                            placeholder="Street, City, Area"
                            onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </div>

                {/* --- Course Details --- */}
                <div className="md:col-span-2 flex items-center gap-2 border-b pb-2 mt-4 mb-2">
                    <BookOpen size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Course Enrollment</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Select Course</label>
                    <input required className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        placeholder="e.g. Graphic Designing"
                        onChange={e => setFormData({ ...formData, course: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Course Duration</label>
                    <input required className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        placeholder="e.g. 6 Months"
                        onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                </div>

                {/* --- Qualification Section --- */}
                <div className="md:col-span-2 flex items-center gap-2 border-b pb-2 mt-4 mb-2">
                    <GraduationCap size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Qualification (Matric/O-Level)</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Obtained Marks</label>
                    <input className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        placeholder="e.g. 850"
                        onChange={e => setFormData({ ...formData, marks: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1">Passing Year</label>
                    <input className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                        placeholder="e.g. 2023"
                        onChange={e => setFormData({ ...formData, year: e.target.value })} />
                </div>

                {/* Submit Button */}
                <button
                    disabled={loading}
                    type="submit"
                    className="md:col-span-2 bg-slate-900 text-white font-black py-4 rounded-[1.5rem] mt-4 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest text-sm"
                >
                    {loading ? "PROCESSING..." : <><Save size={18} /> CONFIRM & SUBMIT ADMISSION</>}
                </button>
            </form>
        </div>
    );
}

// Main Page with Suspense to prevent SSR error for searchParams
export default function CreateFormPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <Suspense fallback={<div className="text-center p-20 font-bold">Loading Form...</div>}>
                <FormContent />
            </Suspense>
        </div>
    );
}