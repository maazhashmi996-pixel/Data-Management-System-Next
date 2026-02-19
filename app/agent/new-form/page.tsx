"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ArrowLeft, GraduationCap, DollarSign, User, BookOpen } from 'lucide-react';
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
            classSchedule: '',
            remarks: '',
            issuedBy: 'Agent Portal'
        }
    });

    // --- 1. DYNAMIC LOGO LOGIC ---
    // Agar formType 'DIB Education System' hai to dib-logo dikhayega, warna ez-logo
    const logoSrc = formData.formType === 'DIB Education System' ? '/dib-logo.png' : '/ez-logo.png';

    useEffect(() => {
        const total = parseFloat(formData.officeUse.totalFee) || 0;
        const paid = parseFloat(formData.officeUse.registrationFee) || 0;
        const balance = total - paid;

        setFormData(prev => ({
            ...prev,
            officeUse: {
                ...prev.officeUse,
                balanceAmount: balance.toString()
            }
        }));
    }, [formData.officeUse.totalFee, formData.officeUse.registrationFee]);

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
        const API_URL = 'http://localhost:5000/api/agent/submit';

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Session expired. Please login again.");
                router.push('/login');
                return;
            }

            const res = await axios.post(API_URL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                alert("Admission Form Submitted Successfully!");
                router.push('/agent/dashboard');
            }
        } catch (error: any) {
            console.error("Submission Error:", error.response || error);
            alert(`Error: ${error.response?.data?.message || "Server connection failed!"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 text-black">
            <div className="w-full max-w-3xl bg-white shadow-xl rounded-[2rem] overflow-hidden border border-slate-200">

                {/* --- UPDATED HEADER WITH LOGO --- */}
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-2xl shadow-inner">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="h-14 w-14 object-contain"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                            />
                        </div>
                        <div>
                            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-1 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
                                <ArrowLeft size={14} /> Back
                            </button>
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">New Admission</h2>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest text-white ${formData.formType === 'DIB Education System' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                            {formData.formType}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-10">

                    {/* 1. Student Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 border-b pb-2">
                            <User size={20} />
                            <p className="font-black text-sm uppercase tracking-widest">Student Information</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="studentName" placeholder="Student Full Name" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 focus:bg-white transition-all text-black" required />
                            <input type="text" name="fatherName" placeholder="Father's Name" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 focus:bg-white transition-all text-black" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="cnic" placeholder="CNIC / B-Form No" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 text-black" required />
                            <input type="text" name="mobileNo" placeholder="Mobile Number" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 text-black" required />
                        </div>
                        <input type="text" name="address" placeholder="Residential Address" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 focus:bg-white transition-all text-black" />
                    </div>

                    {/* 2. Course Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-purple-600 border-b pb-2">
                            <BookOpen size={20} />
                            <p className="font-black text-sm uppercase tracking-widest">Course Enrollment</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="course" placeholder="Applied Course Name" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 text-black" required />
                            <select name="duration" onChange={handleChange} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-blue-500 text-black font-semibold" required>
                                <option value="">Select Duration</option>
                                <option value="3 Months">3 Months</option>
                                <option value="6 Months">6 Months</option>
                                <option value="1 Year">1 Year</option>
                            </select>
                        </div>
                    </div>

                    {/* 3. Academic Qualifications */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-emerald-600 border-b pb-2">
                            <GraduationCap size={20} />
                            <p className="font-black text-sm uppercase tracking-widest">Academic Background</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matric / O-Level</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" name="board" placeholder="Board" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-3 text-sm bg-white border rounded-xl" />
                                <input type="text" name="marks" placeholder="Marks" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-3 text-sm bg-white border rounded-xl" />
                                <input type="text" name="year" placeholder="Year" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-3 text-sm bg-white border rounded-xl" />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inter / A-Level</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" name="board" placeholder="Board" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="p-3 text-sm bg-white border rounded-xl" />
                                <input type="text" name="marks" placeholder="Marks" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="p-3 text-sm bg-white border rounded-xl" />
                                <input type="text" name="year" placeholder="Year" onChange={(e) => handleChange(e, 'qualification', 'inter')} className="p-3 text-sm bg-white border rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Fee Details */}
                    <div className="space-y-6 pb-10">
                        <div className="flex items-center gap-2 text-orange-600 border-b pb-2">
                            <DollarSign size={20} />
                            <p className="font-black text-sm uppercase tracking-widest">Fee Details</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold ml-2 text-slate-400">TOTAL FEE</label>
                                <input type="number" name="totalFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-black font-bold outline-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold ml-2 text-slate-400">PAID AMOUNT</label>
                                <input type="number" name="registrationFee" placeholder="0" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-green-600 font-bold outline-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold ml-2 text-slate-400">BALANCE</label>
                                <input type="text" name="balanceAmount" value={formData.officeUse.balanceAmount} readOnly className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-red-600 font-bold cursor-not-allowed" />
                            </div>
                        </div>
                        <input type="text" name="classSchedule" placeholder="Class Schedule (e.g 10AM-12PM)" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-black" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50">
                        <Save size={24} /> {loading ? 'PROCESSING...' : 'CONFIRM ADMISSION'}
                    </button>
                </form>
            </div>
        </div>
    );
}