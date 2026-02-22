"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ArrowLeft, GraduationCap, DollarSign, User, BookOpen, MapPin, Calendar, Mail, Globe } from 'lucide-react';
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
        email: '',
        address: '',
        city: 'Lahore',
        gender: 'Male',
        dob: '',
        age: '',
        course: '',
        duration: '',
        purpose: 'Pakistan', // DEFAULT VALUE
        formType: forcedType || 'Education Zone',
        admissionType: 'Regular',
        date: new Date().toISOString().split('T')[0],
        qualification: {
            matric: { board: '', marks: '', year: '' },
            inter: { board: '', marks: '', year: '' }
        },
        officeUse: {
            totalFee: '',
            registrationFee: '',
            balanceAmount: '0',
            noOfInstallments: '1',
            monthlyInstallment: '0',
            classSchedule: '',
            issuedBy: 'Admin'
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

        const API_URL = 'http://localhost:5000/api/admin/add-form';

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                alert("Admission Form Submitted Successfully!");
                router.push('/agent/dashboard');
            }
        } catch (error: any) {
            console.error("Submission Error:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Submission failed";
            alert(`Error: ${errorMsg}`);
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
                            <h2 className="text-2xl font-black uppercase tracking-tight">New Enrollment Form</h2>
                        </div>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/30 text-right">
                        <p className="text-[10px] font-bold uppercase opacity-80">Institution Type</p>
                        <p className="font-black text-sm">{formData.formType}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">

                    {/* 1. PERSONAL DETAILS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <User className="text-blue-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Personal Details</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <input type="text" name="studentName" placeholder="STUDENT NAME" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" required />
                            <input type="text" name="fatherName" placeholder="FATHER NAME" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <input type="text" name="cnic" placeholder="CNIC (e.g. 35201-XXXXXXX-X)" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" required />
                            <input type="text" name="mobileNo" placeholder="MOBILE NO" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono" required />
                            <input type="email" name="email" placeholder="EMAIL ADDRESS" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">DATE OF BIRTH</label>
                                <input type="date" name="dob" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">GENDER</label>
                                <select name="gender" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">CITY</label>
                                <input type="text" name="city" placeholder="Lahore" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                            </div>
                        </div>
                        <input type="text" name="address" placeholder="COMPLETE ADDRESS" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" required />
                    </div>

                    {/* 2. ACADEMIC QUALIFICATION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <GraduationCap className="text-emerald-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Academic Qualification</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <p className="font-black text-xs text-slate-500 underline">MATRIC / O-LEVEL</p>
                                <input type="text" name="board" placeholder="Board Name" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="marks" placeholder="Marks" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                    <input type="text" name="year" placeholder="Year" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <p className="font-black text-xs text-slate-500 underline">INTER / A-LEVEL</p>
                                <input type="text" name="board" placeholder="Board Name" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name="marks" placeholder="Marks" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                    <input type="text" name="year" placeholder="Year" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="p-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. COURSE INFO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <BookOpen className="text-purple-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Course Information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <input type="text" name="course" placeholder="COURSE NAME" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" required />
                            <select name="duration" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required>
                                <option value="">SELECT DURATION</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                            </select>
                            {/* --- ADDED PURPOSE FIELD --- */}
                            <select name="purpose" onChange={handleChange} value={formData.purpose} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required>
                                <option value="Pakistan">Pakistan</option>
                                <option value="Study Abroad">Study Abroad</option>
                            </select>
                        </div>
                    </div>

                    {/* 4. FEE STRUCTURE */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 border-b-2 border-slate-100 pb-3">
                            <DollarSign className="text-orange-500" size={22} />
                            <p className="font-black text-sm uppercase tracking-widest">Fee Structure</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 p-6 rounded-[2rem] text-white">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-1">TOTAL FEE</label>
                                <input type="number" name="totalFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-black text-lg text-white" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-1">REG. FEE PAID</label>
                                <input type="number" name="registrationFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-black text-lg text-green-400" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-1">INSTALLMENTS</label>
                                <input type="number" name="noOfInstallments" min="1" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl font-black text-lg" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-1">MONTHLY</label>
                                <div className="p-3 bg-indigo-500 rounded-xl font-black text-lg text-center">
                                    {formData.officeUse.monthlyInstallment}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">REMAINING BALANCE</label>
                                <input type="text" value={formData.officeUse.balanceAmount} readOnly className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-black text-xl" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 ml-2">CLASS SCHEDULE</label>
                                <input type="text" name="classSchedule" placeholder="e.g. Mon-Fri (2-4 PM)" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button type="submit" disabled={loading} className={`w-full py-6 rounded-3xl font-black text-xl tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl disabled:opacity-50 ${formData.formType === 'DIB Education System' ? 'bg-indigo-900 hover:bg-indigo-950' : 'bg-orange-600 hover:bg-orange-700'} text-white`}>
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