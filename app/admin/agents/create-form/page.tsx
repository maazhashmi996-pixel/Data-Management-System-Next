"use client";
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, GraduationCap, User, BookOpen, CreditCard, School } from 'lucide-react';

function FormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const typeFromUrl = searchParams ? searchParams.get('type') : null;
    const [selectedType, setSelectedType] = useState(typeFromUrl === 'ez' ? 'Education Zone' : 'DIB Education System');

    const [formData, setFormData] = useState({
        studentName: '',
        fatherName: '',
        cnic: '',
        mobileNo: '',
        address: '',
        email: '',
        course: '',
        duration: '',
        dob: '',
        age: '',
        gender: 'Male',
        city: 'Lahore',
        // Academic Fields
        matricBoard: '',
        matricMarks: '',
        matricYear: '',
        interBoard: '',
        interMarks: '',
        interYear: '',
        // Fee Fields
        totalFee: 0,
        registrationFee: 0,
        balanceAmount: 0,
    });

    // --- LOGO LOGIC ---
    const logoSrc = selectedType === 'Education Zone' ? '/ez-logo.png' : '/dib-logo.png';

    useEffect(() => {
        const total = Number(formData.totalFee) || 0;
        const paid = Number(formData.registrationFee) || 0;
        setFormData(prev => ({ ...prev, balanceAmount: total - paid }));
    }, [formData.totalFee, formData.registrationFee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        try {
            const payload = {
                formType: selectedType,
                date: new Date().toLocaleDateString('en-GB'),
                studentName: formData.studentName?.trim().toUpperCase(),
                fatherName: formData.fatherName?.trim().toUpperCase(),
                cnic: formData.cnic?.trim(),
                mobileNo: formData.mobileNo?.trim(),
                email: formData.email || "N/A",
                address: formData.address?.trim(),
                city: formData.city,
                gender: formData.gender,
                dob: formData.dob,
                age: formData.age || "N/A",
                course: formData.course?.trim(),
                duration: formData.duration,
                admissionType: "Regular",
                qualification: {
                    matric: {
                        board: formData.matricBoard || "N/A",
                        marks: formData.matricMarks || "N/A",
                        year: formData.matricYear || "N/A"
                    },
                    inter: {
                        board: formData.interBoard || "N/A",
                        marks: formData.interMarks || "N/A",
                        year: formData.interYear || "N/A"
                    }
                },
                officeUse: {
                    totalFee: formData.totalFee.toString(),
                    registrationFee: formData.registrationFee.toString(),
                    balanceAmount: formData.balanceAmount.toString(),
                    classSchedule: "TBA",
                    issuedBy: "Admin Portal"
                }
            };

            const res = await axios.post('http://127.0.0.1:5000/api/agent/submit', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                alert(`Admission Successful! Reg No: ${res.data.regNo}`);
                router.push('/admin/dashboard');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Unknown Server Error";
            alert(`Submission Failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const isEZ = selectedType === 'Education Zone';

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 mb-10">

            {/* --- UPDATED HEADER WITH LOGO --- */}
            <div className={`p-8 text-white flex justify-between items-center transition-all duration-500 ${isEZ ? 'bg-orange-600' : 'bg-indigo-900'}`}>
                <div className="flex items-center gap-5">
                    {/* Dynamic Logo Container */}
                    <div className="bg-white p-2 rounded-2xl shadow-lg shadow-black/20">
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="h-14 w-14 object-contain"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{selectedType}</h2>
                        <p className="opacity-90 font-medium tracking-widest text-[10px] mt-1">NEW STUDENT ENROLLMENT SYSTEM</p>
                    </div>
                </div>
                <button type="button" onClick={() => router.back()} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all">
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* System Selector */}
            <div className="bg-slate-50 p-6 border-b flex justify-center gap-4">
                <button type="button" onClick={() => setSelectedType('DIB Education System')}
                    className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${selectedType === 'DIB Education System' ? 'bg-indigo-900 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border'}`}>
                    DIB SYSTEM
                </button>
                <button type="button" onClick={() => setSelectedType('Education Zone')}
                    className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${selectedType === 'Education Zone' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border'}`}>
                    EZ SYSTEM
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 text-black">

                {/* 1. PERSONAL INFO */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 flex items-center gap-2 border-b-2 pb-2"><User size={18} className="text-slate-400" /><h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">1. Personal Information</h3></div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Student Full Name</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200 uppercase"
                            value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Father's Name</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200 uppercase"
                            value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CNIC / B-Form</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200" placeholder="35201-XXXXXXX-X"
                            value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mobile / WhatsApp</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.mobileNo} onChange={e => setFormData({ ...formData, mobileNo: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date of Birth</label>
                        <input type="date" required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">City</label>
                        <input className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Permanent Residential Address</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </section>

                {/* 2. ACADEMIC QUALIFICATION */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div className="md:col-span-2 flex items-center gap-2 border-b pb-2 mb-2"><School size={18} className="text-slate-400" /><h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">2. Academic Qualification</h3></div>

                    <div className="space-y-3 p-4 bg-white rounded-2xl shadow-sm">
                        <h4 className={`text-[11px] font-black uppercase ${isEZ ? 'text-orange-600' : 'text-indigo-900'}`}>Matric / O-Level</h4>
                        <input placeholder="Board / University" className="w-full p-2.5 bg-slate-50 rounded-xl text-sm border"
                            value={formData.matricBoard} onChange={e => setFormData({ ...formData, matricBoard: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Marks/Grade" className="p-2.5 bg-slate-50 rounded-xl text-sm border"
                                value={formData.matricMarks} onChange={e => setFormData({ ...formData, matricMarks: e.target.value })} />
                            <input placeholder="Year" className="p-2.5 bg-slate-50 rounded-xl text-sm border"
                                value={formData.matricYear} onChange={e => setFormData({ ...formData, matricYear: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 bg-white rounded-2xl shadow-sm">
                        <h4 className={`text-[11px] font-black uppercase ${isEZ ? 'text-orange-600' : 'text-indigo-900'}`}>Inter / A-Level</h4>
                        <input placeholder="Board / University" className="w-full p-2.5 bg-slate-50 rounded-xl text-sm border"
                            value={formData.interBoard} onChange={e => setFormData({ ...formData, interBoard: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Marks/Grade" className="p-2.5 bg-slate-50 rounded-xl text-sm border"
                                value={formData.interMarks} onChange={e => setFormData({ ...formData, interMarks: e.target.value })} />
                            <input placeholder="Year" className="p-2.5 bg-slate-50 rounded-xl text-sm border"
                                value={formData.interYear} onChange={e => setFormData({ ...formData, interYear: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* 3. COURSE DETAILS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 flex items-center gap-2 border-b-2 pb-2"><BookOpen size={18} className="text-slate-400" /><h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">3. Course Details</h3></div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Applied Course Name</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200 uppercase"
                            value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Course Duration</label>
                        <select required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200 font-bold"
                            value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}>
                            <option value="">Select Duration</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="1 Year">1 Year</option>
                            <option value="2 Year">2 Year</option>
                        </select>
                    </div>
                </section>

                {/* 4. FEE INFORMATION */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 flex items-center gap-2 border-b-2 pb-2"><CreditCard size={18} className="text-slate-400" /><h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">4. Fee Information</h3></div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Total Fee Amount</label>
                        <input type="number" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold border border-transparent focus:border-slate-200"
                            value={formData.totalFee} onChange={e => setFormData({ ...formData, totalFee: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Initial Deposit (Paid)</label>
                        <input type="number" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold border border-transparent focus:border-slate-200"
                            value={formData.registrationFee} onChange={e => setFormData({ ...formData, registrationFee: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-red-400 uppercase ml-1">Remaining Balance</label>
                        <input readOnly className="w-full bg-red-50 p-3.5 rounded-2xl font-bold text-red-600 border border-red-100"
                            value={formData.balanceAmount} />
                    </div>

                    <button disabled={loading} type="submit"
                        className={`md:col-span-3 text-white font-black py-5 rounded-[2rem] mt-6 transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isEZ ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-900 hover:bg-indigo-950'}`}>
                        {loading ? "PROCESSING..." : "REGISTER STUDENT"}
                    </button>
                </section>
            </form>
        </div>
    );
}

export default function CreateFormPage() {
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <Suspense fallback={<div className="flex justify-center mt-20 font-black text-slate-400 animate-pulse">LOADING FORM...</div>}>
                <FormContent />
            </Suspense>
        </div>
    );
}