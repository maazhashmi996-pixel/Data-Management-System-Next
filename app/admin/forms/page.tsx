"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, User, BookOpen, MapPin, Calendar, Award, Mail, Plus, X, Save, Phone, Fingerprint, Home, GraduationCap, ClipboardList } from 'lucide-react';

export default function AllFormsPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);

    // Full Form State including Qualifications & Fees
    const [formData, setFormData] = useState({
        studentName: '',
        fatherName: '',
        cnic: '',
        email: '',
        mobileNo: '',
        whatsappNo: '',
        city: '',
        gender: '',
        dob: '',
        address: '',
        course: '',
        duration: '',
        regNo: '',
        agentName: '',
        // Qualifications Section (Specifically for O/A Levels)
        matricOLevelMarks: '',
        matricOLevelYear: '',
        interALevelMarks: '',
        interALevelYear: '',
        // Fee Section
        totalFee: '0',
        paidAmount: '0',
        balance: '0',
        remarks: ''
    });

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/forms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(Array.isArray(res.data) ? (res.data as any[]) : []);
        } catch (err) {
            console.error("Error fetching forms", err);
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-calculate balance if fee fields change
            if (name === 'totalFee' || name === 'paidAmount') {
                const total = parseFloat(updated.totalFee) || 0;
                const paid = parseFloat(updated.paidAmount) || 0;
                updated.balance = (total - paid).toString();
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/admin/add-form', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Admission Record Saved Successfully!");
            setShowAddForm(false);
            fetchForms();
        } catch (err) {
            alert("❌ Failed to save. Ensure your Backend supports O-Level/Fee fields.");
        }
    };

    const deleteForm = async (id: string) => {
        if (!confirm("Delete this record permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/delete-form/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(forms.filter((f: any) => f._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const filteredForms = forms.filter((f: any) => {
        const name = f?.studentName?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return name.includes(search);
    });

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-black font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">EDUCATION ZONE</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Student Enrollment System</p>
                    </div>

                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${showAddForm ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {showAddForm ? <><X size={20} /> CLOSE FORM</> : <><Plus size={20} /> NEW ADMISSION</>}
                    </button>
                </div>

                {showAddForm && (
                    <div className="bg-white border-2 border-slate-200 rounded-[3rem] p-10 mb-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* 1. Personal Information */}
                            <section>
                                <h3 className="flex items-center gap-2 text-blue-600 font-black mb-6 uppercase tracking-widest text-sm">
                                    <User size={18} /> 1. Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">STUDENT FULL NAME</label>
                                        <input type="text" name="studentName" placeholder="John Doe" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">FATHER'S NAME</label>
                                        <input type="text" name="fatherName" placeholder="Father Name" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">CNIC / B-FORM</label>
                                        <input type="text" name="cnic" placeholder="35201-XXXXXXX-X" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">MOBILE / WHATSAPP</label>
                                        <input type="text" name="mobileNo" placeholder="03XXXXXXXXX" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">DATE OF BIRTH</label>
                                        <input type="date" name="dob" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">RESIDENT CITY</label>
                                        <input type="text" name="city" placeholder="Lahore" onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2">PERMANENT RESIDENTIAL ADDRESS</label>
                                        <input type="text" name="address" placeholder="House #, Street #, Area..." onChange={handleInputChange} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </div>
                                </div>
                            </section>

                            {/* 2. QUALIFICATIONS (Exactly like your Physical Form) */}
                            <section className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100">
                                <h3 className="flex items-center gap-2 text-blue-700 font-black mb-6 uppercase tracking-widest text-sm">
                                    <GraduationCap size={20} /> 2. Qualifications (O-Level / Matric)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Matric / O-Level */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-blue-900/50 uppercase">Matric / O-Level Details</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" name="matricOLevelMarks" placeholder="Marks Obtained" onChange={handleInputChange} className="p-4 bg-white rounded-xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-400" />
                                            <input type="text" name="matricOLevelYear" placeholder="Passing Year" onChange={handleInputChange} className="p-4 bg-white rounded-xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                    </div>
                                    {/* Inter / A-Level */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-blue-900/50 uppercase">Inter / A-Level Details</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" name="interALevelMarks" placeholder="Marks Obtained" onChange={handleInputChange} className="p-4 bg-white rounded-xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-400" />
                                            <input type="text" name="interALevelYear" placeholder="Passing Year" onChange={handleInputChange} className="p-4 bg-white rounded-xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-400" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Course Details */}
                            <section>
                                <h3 className="flex items-center gap-2 text-slate-800 font-black mb-6 uppercase tracking-widest text-sm">
                                    <BookOpen size={18} /> 3. Course Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <input type="text" name="course" placeholder="Applied Course Name" onChange={handleInputChange} className="p-4 bg-slate-50 rounded-2xl font-bold md:col-span-2" required />
                                    <select name="duration" onChange={handleInputChange} className="p-4 bg-slate-50 rounded-2xl font-bold">
                                        <option value="">Select Duration</option>
                                        <option value="3 Months">3 Months</option>
                                        <option value="6 Months">6 Months</option>
                                        <option value="1 Year">1 Year</option>
                                        <option value="2 Year">2 Year</option>
                                    </select>
                                    <input type="text" name="agentName" placeholder="Reference / Agent Name" onChange={handleInputChange} className="p-4 bg-slate-50 rounded-2xl font-bold" />
                                    <input type="text" name="regNo" placeholder="Registration Number (If any)" onChange={handleInputChange} className="p-4 bg-slate-50 rounded-2xl font-bold" />
                                </div>
                            </section>

                            {/* 4. Fee Information (Office Use) */}
                            <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                                <h3 className="flex items-center gap-2 text-blue-400 font-black mb-6 uppercase tracking-widest text-sm">
                                    <ClipboardList size={18} /> 4. Fee Information (Office Use Only)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">TOTAL FEE</label>
                                        <input type="number" name="totalFee" value={formData.totalFee} onChange={handleInputChange} className="w-full p-4 bg-white/10 rounded-xl font-bold outline-none focus:bg-white/20 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">PAID AMOUNT</label>
                                        <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} className="w-full p-4 bg-white/10 rounded-xl font-bold outline-none focus:bg-white/20 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">BALANCE</label>
                                        <input type="text" name="balance" value={formData.balance} readOnly className="w-full p-4 bg-red-500/20 text-red-400 rounded-xl font-black outline-none border border-red-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400">REMARKS</label>
                                        <input type="text" name="remarks" placeholder="Any notes..." onChange={handleInputChange} className="w-full p-4 bg-white/10 rounded-xl font-bold outline-none focus:bg-white/20 transition-all" />
                                    </div>
                                </div>
                            </section>

                            <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl hover:bg-blue-700 transition-all shadow-2xl flex items-center justify-center gap-4 text-xl tracking-tighter">
                                <Save size={28} /> SUBMIT ADMISSION RECORD
                            </button>
                        </form>
                    </div>
                )}

                {/* --- SEARCHBAR --- */}
                <div className="relative mb-10 group">
                    <Search className="absolute left-6 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Search by student name..."
                        className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] shadow-lg focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-lg"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Details</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Applied Program</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                                    <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-32 text-center text-slate-400 animate-pulse font-black text-2xl italic tracking-tighter uppercase">Initializing Database...</td></tr>
                                ) : filteredForms.length === 0 ? (
                                    <tr><td colSpan={5} className="p-32 text-center text-slate-400 font-bold text-xl uppercase tracking-widest">No Records Found</td></tr>
                                ) : filteredForms.map((form: any) => (
                                    <tr key={form._id} className="hover:bg-blue-50/40 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-black rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl uppercase">
                                                    {form.studentName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg uppercase leading-none tracking-tighter">{form.studentName}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase italic tracking-tighter">Reg: {form.regNo || "N/A"}</span>
                                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">{form.city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-1.5">
                                                <p className="text-[11px] font-black text-slate-400 uppercase">Qualifications:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">O-Level: {form.matricOLevelMarks || "0"}</span>
                                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">A-Level: {form.interALevelMarks || "0"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><BookOpen size={18} /></div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{form.course}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">{form.duration}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 w-fit">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Due Balance</p>
                                                <p className={`text-lg font-black tracking-tighter ${parseFloat(form.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    RS. {form.balance || "0"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <button onClick={() => deleteForm(form._id)} className="p-4 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
                                                <Trash2 size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}