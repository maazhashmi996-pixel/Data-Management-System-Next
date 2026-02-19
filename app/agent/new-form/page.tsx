"use client";
import { useState, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Save, Printer, ArrowLeft, GraduationCap, DollarSign, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdmissionForm from '@/Components/AdmissionForm';

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
            issuedBy: ''
        }
    });

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: printRef,
        documentTitle: `Admission_Form_${formData.studentName}`,
    });

    // TypeScript error fix: Using any for state updates to handle dynamic nested keys
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section?: string, subSection?: string) => {
        const { name, value } = e.target;

        setFormData((prev: any) => {
            if (section && subSection) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [subSection]: {
                            ...prev[section][subSection],
                            [name]: value
                        }
                    }
                };
            }
            if (section) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [name]: value
                    }
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/agent/create-form', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Form Saved Successfully!");
            router.push('/agent/dashboard');
        } catch (error) {
            console.error(error);
            alert("Error saving form. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row h-screen overflow-hidden">

            {/* --- LEFT SIDE: INPUT FORM --- */}
            <div className="w-full lg:w-[400px] bg-white shadow-2xl overflow-y-auto h-full border-r border-slate-200 z-20">
                <div className="p-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-black transition-all font-bold text-sm uppercase tracking-tighter">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>

                    <h2 className="text-2xl font-black text-slate-800 mb-8 uppercase">New Enrollment</h2>

                    <form onSubmit={handleSubmit} className="space-y-8 pb-32">

                        {/* 1. Student Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-600">
                                <User size={18} />
                                <p className="font-black text-xs uppercase tracking-widest">Student Information</p>
                            </div>
                            <input type="text" name="studentName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                            <input type="text" name="fatherName" placeholder="Father's Name" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" name="cnic" placeholder="CNIC No" onChange={handleChange} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                                <input type="text" name="mobileNo" placeholder="Mobile No" onChange={handleChange} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                            </div>
                            <input type="email" name="email" placeholder="Email Address (Optional)" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" />
                            <input type="text" name="address" placeholder="Residential Address" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" />
                        </div>

                        {/* 2. Course Details */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-purple-600">
                                <p className="font-black text-xs uppercase tracking-widest">Course Enrollment</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" name="course" placeholder="Course Name" onChange={handleChange} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                                <input type="text" name="duration" placeholder="Duration (Months)" onChange={handleChange} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" required />
                            </div>
                        </div>

                        {/* 3. Academic Qualifications */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <GraduationCap size={18} />
                                <p className="font-black text-xs uppercase tracking-widest">Qualifications</p>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400">MATRIC / O-LEVEL:</p>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="text" name="board" placeholder="Board" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                                <input type="text" name="marks" placeholder="Marks" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                                <input type="text" name="year" placeholder="Year" onChange={(e) => handleChange(e, 'qualification', 'matric')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                            </div>
                        </div>

                        {/* 4. Office Use */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-orange-600">
                                <DollarSign size={18} />
                                <p className="font-black text-xs uppercase tracking-widest">Office & Fee</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" name="totalFee" placeholder="Total" onChange={(e) => handleChange(e, 'officeUse')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                                <input type="number" name="registrationFee" placeholder="Reg" onChange={(e) => handleChange(e, 'officeUse')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                                <input type="number" name="balanceAmount" placeholder="Balance" onChange={(e) => handleChange(e, 'officeUse')} className="p-2 text-xs bg-slate-50 border rounded-lg outline-blue-500" />
                            </div>
                            <input type="text" name="classSchedule" placeholder="Class Schedule (e.g 10AM-12PM)" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" />
                            <input type="text" name="remarks" placeholder="Any Remarks" onChange={(e) => handleChange(e, 'officeUse')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-blue-500 focus:bg-white transition-all" />
                        </div>

                        {/* Action Buttons Floating */}
                        <div className="fixed bottom-0 left-0 w-full lg:w-[400px] p-4 bg-white border-t flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                                <Save size={18} /> {loading ? 'SAVING...' : 'SAVE RECORD'}
                            </button>
                            <button type="button" onClick={() => handlePrint()} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                <Printer size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- RIGHT SIDE: LIVE PREVIEW --- */}
            <div className="flex-1 p-10 flex justify-center bg-slate-200 overflow-y-auto h-full scrollbar-hide">
                <div className="scale-[0.6] md:scale-[0.8] lg:scale-[0.9] xl:scale-100 origin-top shadow-2xl transition-transform duration-500">
                    <AdmissionForm
                        ref={printRef}
                        data={formData}
                        type={formData.formType as any}
                    />
                </div>
            </div>

        </div>
    );
}