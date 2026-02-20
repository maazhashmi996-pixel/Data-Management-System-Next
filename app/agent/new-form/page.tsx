"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ArrowLeft, GraduationCap, DollarSign, User, BookOpen, Calculator } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateEnrollment() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const forcedType = searchParams.get('type') as 'Education Zone' | 'DIB Education System';

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
        formType: forcedType || 'Education Zone',
        qualification: {
            matric: { board: '', marks: '', year: '' },
            inter: { board: '', marks: '', year: '' }
        },
        officeUse: {
            totalFee: '',
            registrationFee: '',
            balanceAmount: '',
            noOfInstallments: '1', // Default 1
            monthlyInstallment: '0',
            classSchedule: '',
            remarks: '',
            issuedBy: 'Agent Portal'
        }
    });

    const logoSrc = formData.formType === 'DIB Education System' ? '/dib-logo.png' : '/ez-logo.png';

    // --- AUTO CALCULATION LOGIC ---
    useEffect(() => {
        const total = parseFloat(formData.officeUse.totalFee) || 0;
        const paid = parseFloat(formData.officeUse.registrationFee) || 0;
        const installments = parseInt(formData.officeUse.noOfInstallments) || 1;

        const balance = total - paid;
        const monthly = balance > 0 ? Math.round(balance / installments) : 0;

        setFormData(prev => ({
            ...prev,
            officeUse: {
                ...prev.officeUse,
                balanceAmount: balance.toString(),
                monthlyInstallment: monthly.toString()
            }
        }));
    }, [formData.officeUse.totalFee, formData.officeUse.registrationFee, formData.officeUse.noOfInstallments]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section?: string, subSection?: string) => {
        const { name, value } = e.target;

        setFormData((prev: any) => {
            if (section && subSection) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [subSection]: { ...prev[section][subSection], [name]: value }
                    }
                };
            }
            if (section) {
                return {
                    ...prev,
                    [section]: { ...prev[section], [name]: value }
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Ensure you use the correct API endpoint (Admin or Agent)
        const API_URL = 'http://localhost:5000/api/admin/add-form';

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert("Admission Form Submitted Successfully!");
                router.push('/admin/dashboard');
            }
        } catch (error: any) {
            console.error("Submission Error:", error);
            alert(`Error: ${error.response?.data?.error || "Submission failed"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 text-black font-sans">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200">

                {/* --- HEADER --- */}
                <div className={`p-8 flex justify-between items-center text-white ${formData.formType === 'DIB Education System' ? 'bg-indigo-900' : 'bg-orange-600'}`}>
                    <div className="flex items-center gap-5">
                        <div className="bg-white p-2 rounded-2xl shadow-lg">
                            <img src={logoSrc} alt="Logo" className="h-16 w-16 object-contain" />
                        </div>
                        <div>
                            <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-200 hover:text-white mb-1 text-xs font-bold uppercase">
                                <ArrowLeft size={14} /> Back
                            </button>
                            <h2 className="text-2xl font-black uppercase tracking-tight">New Admission Form</h2>
                        </div>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-right">
                        <p className="text-[10px] font-bold uppercase opacity-80">Institution Type</p>
                        <p className="font-black text-sm">{formData.formType}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">

                    {/* 1. STUDENT INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <User className="text-blue-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Personal Details</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Full Name</label>
                                <input type="text" name="studentName" placeholder="AS PER MATRIC" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase font-bold" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase">Father's Name</label>
                                <input type="text" name="fatherName" placeholder="GUARDIAN NAME" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase font-bold" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" name="cnic" placeholder="CNIC / B-FORM (35201-XXXXXXX-X)" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" required />
                            <input type="text" name="mobileNo" placeholder="WHATSAPP / MOBILE NO" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" required />
                        </div>
                        <input type="text" name="address" placeholder="COMPLETE RESIDENTIAL ADDRESS" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" required />
                    </div>

                    {/* 2. COURSE INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <BookOpen className="text-purple-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Course Information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" name="course" placeholder="COURSE NAME (e.g. Graphic Designing)" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" required />
                            <select name="duration" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required>
                                <option value="">SELECT DURATION</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Year</option>
                            </select>
                        </div>
                    </div>

                    {/* 3. FEE & INSTALLMENTS (NEW FIELDS ADDED) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <DollarSign className="text-orange-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Fee Structure & Installments</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">TOTAL COURSE FEE</label>
                                <input type="number" name="totalFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-black text-lg" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">DEPOSIT AMOUNT</label>
                                <input type="number" name="registrationFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-black text-lg text-green-600" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">INSTALLMENTS (QTY)</label>
                                <input type="number" name="noOfInstallments" min="1" placeholder="1" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-black text-lg text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">MONTHLY PAYABLE</label>
                                <div className="p-4 bg-slate-200 border border-slate-300 rounded-xl font-black text-lg text-indigo-700">
                                    {formData.officeUse.monthlyInstallment}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">REMAINING BALANCE</label>
                                <input type="text" value={formData.officeUse.balanceAmount} readOnly className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black text-xl cursor-not-allowed" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">CLASS TIMING</label>
                                <input type="text" name="classSchedule" placeholder="e.g. 02:00 PM - 04:00 PM" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" disabled={loading} className={`w-full py-6 rounded-2xl font-black text-xl tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl disabled:opacity-50 ${formData.formType === 'DIB Education System' ? 'bg-indigo-900 hover:bg-indigo-950' : 'bg-orange-600 hover:bg-orange-700'} text-white`}>
                        {loading ? 'PROCESSING...' : (
                            <>
                                <Save size={24} /> CONFIRM & SAVE ADMISSION
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}