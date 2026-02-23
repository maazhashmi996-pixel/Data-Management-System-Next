"use client";
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, User, BookOpen, CreditCard, School, Loader2, Mail, Clock, Globe, Calendar } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

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
        purpose: 'Pakistan',
        dob: '',
        age: '',
        gender: 'Male',
        city: 'Lahore',
        matricBoard: '',
        matricMarks: '',
        matricYear: '',
        interBoard: '',
        interMarks: '',
        interYear: '',
        totalFee: 0,
        registrationFee: 0,
        balanceAmount: 0,
        noOfInstallments: '1',
        installmentAmount: 0,
        installmentsData: [] as { amount: number; dueDate: string }[]
    });

    const logoSrc = selectedType === 'Education Zone' ? '/ez-logo.png' : '/dib-logo.png';

    // Auto Calculations for Fees
    useEffect(() => {
        const total = Number(formData.totalFee) || 0;
        const paid = Number(formData.registrationFee) || 0;
        const balance = total - paid;
        const count = Number(formData.noOfInstallments) || 1;
        const perMonth = balance > 0 ? Math.round(balance / count) : 0;

        const newInstallments = Array.from({ length: count }).map((_, i) => ({
            amount: perMonth,
            dueDate: formData.installmentsData[i]?.dueDate || ''
        }));

        setFormData(prev => ({
            ...prev,
            balanceAmount: balance,
            installmentAmount: perMonth,
            installmentsData: newInstallments
        }));
    }, [formData.totalFee, formData.registrationFee, formData.noOfInstallments]);

    const handleInstallmentDateChange = (index: number, date: string) => {
        const updated = [...formData.installmentsData];
        updated[index].dueDate = date;
        setFormData({ ...formData, installmentsData: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.course || !formData.duration) {
            toast.error("Please fill Course and Duration!");
            return;
        }

        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        try {
            // Mapping UI state to Mongoose Schema
            const payload = {
                formType: selectedType,
                studentName: formData.studentName?.trim().toUpperCase(),
                fatherName: formData.fatherName?.trim().toUpperCase(),
                cnic: formData.cnic?.trim(),
                mobileNo: formData.mobileNo?.trim(),
                email: formData.email?.trim().toLowerCase() || "N/A",
                address: formData.address?.trim(),
                city: formData.city,
                gender: formData.gender,
                dob: formData.dob,
                course: formData.course?.trim(),
                duration: formData.duration?.trim(),
                purpose: formData.purpose,
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
                // Installments are ROOT level in your schema, NOT inside officeUse
                installments: formData.installmentsData.map(inst => ({
                    amount: inst.amount,
                    dueDate: inst.dueDate || new Date(),
                    status: 'Pending'
                })),
                officeUse: {
                    totalFee: formData.totalFee.toString(),
                    registrationFee: formData.registrationFee.toString(),
                    balanceAmount: formData.balanceAmount.toString(),
                    noOfInstallments: formData.noOfInstallments.toString(),
                    monthlyInstallment: formData.installmentAmount.toString(),
                    classSchedule: "TBA",
                    issuedBy: "Admin"
                }
            };

            const res = await axios.post('http://localhost:5000/api/admin/add-form', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                toast.success(`Registered Successfully! RegNo: ${res.data.student?.regNo}`);
                setTimeout(() => router.push('/admin/dashboard'), 2000);
            }
        } catch (err: any) {
            console.error("AXIOS ERROR DETAILS:", err.response?.data);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Submission Failed";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isEZ = selectedType === 'Education Zone';

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 mb-10">
            <Toaster position="top-right" />

            {/* Header */}
            <div className={`p-8 text-white flex justify-between items-center transition-all duration-500 ${isEZ ? 'bg-orange-600' : 'bg-indigo-900'}`}>
                <div className="flex items-center gap-5">
                    <div className="bg-white p-2 rounded-2xl shadow-lg">
                        <img src={logoSrc} alt="Logo" className="h-14 w-14 object-contain"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{selectedType}</h2>
                        <p className="opacity-90 font-medium tracking-widest text-[10px] mt-1 uppercase">Student Enrollment Portal</p>
                    </div>
                </div>
                <button type="button" onClick={() => router.back()} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all">
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* System Toggle */}
            <div className="bg-slate-50 p-6 border-b flex justify-center gap-4">
                {['DIB Education System', 'Education Zone'].map((sys) => (
                    <button key={sys} type="button" onClick={() => setSelectedType(sys)}
                        className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${selectedType === sys ? (isEZ ? 'bg-orange-600' : 'bg-indigo-900') + ' text-white shadow-lg scale-105' : 'bg-white text-slate-400 border'}`}>
                        {sys.includes('DIB') ? 'DIB SYSTEM' : 'EZ SYSTEM'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 text-black">

                {/* Section 1: Personal Info & Course */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 flex items-center gap-2 border-b-2 pb-2">
                        <User size={18} className="text-slate-400" />
                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">1. Personal & Course Details</h3>
                    </div>

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
                        <input required placeholder="35201-XXXXXXX-X" className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                            <Mail size={10} /> Student Email
                        </label>
                        <input type="email" placeholder="example@gmail.com" className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                            <BookOpen size={10} /> Course Applied For *
                        </label>
                        <input required placeholder="e.g. Web Development" className={`w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 focus:border-slate-400 ${isEZ ? 'border-orange-100' : 'border-indigo-100'}`}
                            value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                            <Clock size={10} /> Course Duration *
                        </label>
                        <input required placeholder="e.g. 3 Months / 1 Year" className={`w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 focus:border-slate-400 ${isEZ ? 'border-orange-100' : 'border-indigo-100'}`}
                            value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                            <Globe size={10} /> Purpose *
                        </label>
                        <select required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })}>
                            <option value="Pakistan">Pakistan</option>
                            <option value="Study Abroad">Study Abroad</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mobile No</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.mobileNo} onChange={e => setFormData({ ...formData, mobileNo: e.target.value })} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date of Birth</label>
                        <input type="date" required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Address</label>
                        <input required className="w-full bg-slate-50 p-3.5 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-slate-200"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </section>

                {/* Section 2: Education History */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div className="md:col-span-2 flex items-center gap-2 border-b pb-2 mb-2">
                        <School size={18} className="text-slate-400" />
                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">2. Education History</h3>
                    </div>

                    {['matric', 'inter'].map((edu) => (
                        <div key={edu} className="space-y-3 p-4 bg-white rounded-2xl shadow-sm">
                            <h4 className={`text-[11px] font-black uppercase ${isEZ ? 'text-orange-600' : 'text-indigo-900'}`}>{edu === 'matric' ? 'Matric / O-Level' : 'Inter / A-Level'}</h4>
                            <input placeholder="Board" className="w-full p-2.5 bg-slate-50 rounded-xl text-sm border font-bold"
                                value={edu === 'matric' ? formData.matricBoard : formData.interBoard}
                                onChange={e => setFormData({ ...formData, [edu === 'matric' ? 'matricBoard' : 'interBoard']: e.target.value })} />
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Marks" className="p-2.5 bg-slate-50 rounded-xl text-sm border font-bold"
                                    value={edu === 'matric' ? formData.matricMarks : formData.interMarks}
                                    onChange={e => setFormData({ ...formData, [edu === 'matric' ? 'matricMarks' : 'interMarks']: e.target.value })} />
                                <input placeholder="Year" className="p-2.5 bg-slate-50 rounded-xl text-sm border font-bold"
                                    value={edu === 'matric' ? formData.matricYear : formData.interYear}
                                    onChange={e => setFormData({ ...formData, [edu === 'matric' ? 'matricYear' : 'interYear']: e.target.value })} />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Section 3: Fee Plan & Installments */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 border-b-2 pb-2">
                        <CreditCard size={18} className="text-slate-400" />
                        <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs">3. Fee Plan & Installments</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Total Fee</label>
                            <input type="number" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold border-2 border-transparent focus:border-slate-200"
                                value={formData.totalFee} onChange={e => setFormData({ ...formData, totalFee: Number(e.target.value) })} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Paid Amount</label>
                            <input type="number" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold border-2 border-transparent focus:border-slate-200"
                                value={formData.registrationFee} onChange={e => setFormData({ ...formData, registrationFee: Number(e.target.value) })} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">No. of Installments</label>
                            <select className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold border-2 border-transparent focus:border-slate-200"
                                value={formData.noOfInstallments} onChange={e => setFormData({ ...formData, noOfInstallments: e.target.value })}>
                                {[1, 2, 3, 4, 6, 8, 12].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-red-400 uppercase ml-1">Remaining Balance</label>
                            <input readOnly className="w-full bg-red-50 p-3.5 rounded-2xl font-bold text-red-600 outline-none" value={formData.balanceAmount} />
                        </div>
                    </div>

                    {/* DYNAMIC INSTALLMENT DUE DATES UI */}
                    {formData.balanceAmount > 0 && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={14} className="text-slate-400" />
                                <h4 className="text-[10px] font-black text-slate-500 uppercase">Set Installment Due Dates</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {formData.installmentsData.map((inst, index) => (
                                    <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Inst. #{index + 1}</span>
                                            <span className="text-xs font-bold text-indigo-600">Rs. {inst.amount}</span>
                                        </div>
                                        <input
                                            type="date"
                                            required
                                            className="text-xs font-bold p-2 bg-slate-50 rounded-lg outline-none border focus:border-indigo-300 transition-all"
                                            value={inst.dueDate}
                                            onChange={(e) => handleInstallmentDateChange(index, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button disabled={loading} type="submit"
                        className={`w-full flex justify-center items-center gap-3 text-white font-black py-5 rounded-[2rem] mt-4 shadow-xl transition-all active:scale-95 disabled:opacity-50 ${isEZ ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-900 hover:bg-indigo-950'}`}>
                        {loading ? <Loader2 className="animate-spin" /> : "REGISTER STUDENT"}
                    </button>
                </section>
            </form>
        </div>
    );
}

export default function CreateFormPage() {
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <Suspense fallback={<div className="text-center mt-20 font-black text-slate-400 animate-pulse uppercase">Initializing System...</div>}>
                <FormContent />
            </Suspense>
        </div>
    );
}