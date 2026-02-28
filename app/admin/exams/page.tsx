"use client";
import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    User,
    Plus,
    X,
    Save,
    DollarSign,
    GraduationCap,
    LayoutDashboard,
    ChevronRight,
    Trash2,
    Loader2
} from 'lucide-react';
import axios from 'axios';

// Backend URL (Railway URL)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-railway-url.railway.app/api";

export default function ExamManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<any[]>([]);

    const [newBooking, setNewBooking] = useState({
        studentName: '',
        fatherName: '',
        examFees: '',
        selectedSubjects: [] as string[]
    });

    const subjectsList = ["English", "Math", "Science", "Social Studies"];

    // --- 1. Fetch Exams from Database ---
    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/agent/exams`);
            setExams(response.data);
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const toggleSubject = (sub: string) => {
        setNewBooking(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.includes(sub)
                ? prev.selectedSubjects.filter(s => s !== sub)
                : [...prev.selectedSubjects, sub]
        }));
    };

    // --- 2. Save Exam to Database ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBooking.selectedSubjects.length === 0) return alert("Select at least one subject");

        try {
            const payload = {
                studentName: newBooking.studentName,
                fatherName: newBooking.fatherName,
                subjects: newBooking.selectedSubjects,
                fees: newBooking.examFees,
                status: "Pending"
            };

            const response = await axios.post(`${API_BASE_URL}/agent/exams`, payload);
            setExams([response.data, ...exams]);
            setIsModalOpen(false);
            setNewBooking({ studentName: '', fatherName: '', examFees: '', selectedSubjects: [] });
        } catch (error) {
            alert("Failed to save exam booking");
        }
    };

    // --- 3. Update Status in Database ---
    const updateStatus = async (id: string, status: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/agent/exams/${id}`, { status });
            setExams(exams.map(ex => ex._id === id ? { ...ex, status } : ex));
        } catch (error) {
            alert("Error updating status");
        }
    };

    // --- 4. Delete Record from Database ---
    const deleteExam = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/agent/exams/${id}`);
            setExams(exams.filter(ex => ex._id !== id));
        } catch (error) {
            alert("Failed to delete record");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">

            {/* Header Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
                        <GraduationCap className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">EXAM<span className="text-indigo-600">HUB</span></h1>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <LayoutDashboard size={12} /> Portal Admin v2.0
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-indigo-200 active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>BOOK NEW EXAM</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto mb-10 relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={22} />
                </div>
                <input
                    type="text"
                    placeholder="Search by student name..."
                    className="w-full p-6 pl-16 bg-white border-none rounded-[2rem] text-lg font-medium shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Loader2 className="animate-spin" size={40} />
                            <p className="font-bold uppercase tracking-widest text-xs">Fetching Records...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-left">Student Profile</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-left">Examination</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-center">Payment</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-left">Status</th>
                                    <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-center">Admin Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {exams.filter(ex => ex.studentName.toLowerCase().includes(searchTerm.toLowerCase())).map((exam) => (
                                    <tr key={exam._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-slate-900 uppercase tracking-tight">{exam.studentName}</div>
                                                    <div className="text-xs font-semibold text-slate-400">S/O: {exam.fatherName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-wrap gap-2">
                                                {exam.subjects.map((s: string) => (
                                                    <span key={s} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tighter shadow-sm">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-emerald-600">RS. {exam.fees}</span>
                                                <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest">Paid</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${exam.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' :
                                                exam.status === 'Fail' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full animate-pulse ${exam.status === 'Pass' ? 'bg-emerald-500' :
                                                    exam.status === 'Fail' ? 'bg-rose-500' : 'bg-amber-500'
                                                    }`} />
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => updateStatus(exam._id, 'Pass')} className="p-2.5 bg-white border border-slate-100 text-emerald-500 rounded-xl shadow-sm hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={16} /></button>
                                                <button onClick={() => updateStatus(exam._id, 'Fail')} className="p-2.5 bg-white border border-slate-100 text-rose-500 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white transition-all"><XCircle size={16} /></button>
                                                <button onClick={() => updateStatus(exam._id, 'Pending')} className="p-2.5 bg-white border border-slate-100 text-amber-500 rounded-xl shadow-sm hover:bg-amber-500 hover:text-white transition-all"><Clock size={16} /></button>
                                                <div className="w-px h-8 bg-slate-100 mx-1" />
                                                <button onClick={() => deleteExam(exam._id)} className="p-2.5 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-sm hover:bg-rose-600 hover:text-white transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">New Entry</h2>
                                <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mt-1">Examination Registration Form</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="relative z-10 bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-12 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                                    <input required type="text" placeholder="e.g. Ali Khan" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase text-slate-700"
                                        onChange={e => setNewBooking({ ...newBooking, studentName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                                    <input required type="text" placeholder="e.g. Ahmed Khan" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase text-slate-700"
                                        onChange={e => setNewBooking({ ...newBooking, fatherName: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subjects</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {subjectsList.map(sub => (
                                        <button
                                            key={sub}
                                            type="button"
                                            onClick={() => toggleSubject(sub)}
                                            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-[10px] font-black uppercase flex justify-between items-center ${newBooking.selectedSubjects.includes(sub)
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {sub}
                                            {newBooking.selectedSubjects.includes(sub) ? <CheckCircle size={16} fill="currentColor" className="text-white" /> : <ChevronRight size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fee Amount</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600">
                                        <DollarSign size={20} />
                                    </div>
                                    <input required type="number" placeholder="0000" className="w-full p-5 pl-14 bg-emerald-50 border-none rounded-2xl outline-none text-emerald-700 font-black text-xl"
                                        onChange={e => setNewBooking({ ...newBooking, examFees: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                                <Save size={20} /> Confirm & Save Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}