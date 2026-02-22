"use client";
import { useState } from 'react';
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
    ChevronRight
} from 'lucide-react';

export default function ExamManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [exams, setExams] = useState([
        { id: 1, studentName: "Ali Khan", fatherName: "Ahmed Khan", subjects: ["Math", "Science"], fees: "2000", status: "Pending" },
    ]);

    const [newBooking, setNewBooking] = useState({
        studentName: '',
        fatherName: '',
        examFees: '',
        selectedSubjects: [] as string[]
    });

    const subjectsList = ["English", "Math", "Science", "Social Studies"];

    const toggleSubject = (sub: string) => {
        setNewBooking(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.includes(sub)
                ? prev.selectedSubjects.filter(s => s !== sub)
                : [...prev.selectedSubjects, sub]
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBooking.selectedSubjects.length === 0) return alert("Select at least one subject");

        const entry = {
            id: Date.now(),
            studentName: newBooking.studentName,
            fatherName: newBooking.fatherName,
            subjects: newBooking.selectedSubjects,
            fees: newBooking.examFees,
            status: "Pending"
        };

        setExams([entry, ...exams]);
        setIsModalOpen(false);
        setNewBooking({ studentName: '', fatherName: '', examFees: '', selectedSubjects: [] });
    };

    const updateStatus = (id: number, status: string) => {
        setExams(exams.map(ex => ex.id === id ? { ...ex, status } : ex));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">

            {/* Top Navigation Bar Style Header */}
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

            {/* Search Section with Neumorphic Touch */}
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

            {/* Main Table Container */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Student Profile</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Examination</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-center">Payment</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                                <th className="p-8 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-center">Admin Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {exams.filter(ex => ex.studentName.toLowerCase().includes(searchTerm.toLowerCase())).map((exam) => (
                                <tr key={exam.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
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
                                            {exam.subjects.map(s => (
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
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => updateStatus(exam.id, 'Pass')} className="p-3 bg-white border border-slate-100 text-emerald-500 rounded-2xl shadow-sm hover:bg-emerald-500 hover:text-white hover:-translate-y-1 transition-all duration-300"><CheckCircle size={18} /></button>
                                            <button onClick={() => updateStatus(exam.id, 'Fail')} className="p-3 bg-white border border-slate-100 text-rose-500 rounded-2xl shadow-sm hover:bg-rose-500 hover:text-white hover:-translate-y-1 transition-all duration-300"><XCircle size={18} /></button>
                                            <button onClick={() => updateStatus(exam.id, 'Pending')} className="p-3 bg-white border border-slate-100 text-amber-500 rounded-2xl shadow-sm hover:bg-amber-500 hover:text-white hover:-translate-y-1 transition-all duration-300"><Clock size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- PREMIUM MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in duration-300">
                        <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">New Entry</h2>
                                <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mt-1">Examination Registration Form</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="relative z-10 bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all"><X size={24} /></button>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>

                        <form onSubmit={handleSave} className="p-12 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                                    <input required type="text" placeholder="e.g. Ali Khan" className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase text-slate-700"
                                        onChange={e => setNewBooking({ ...newBooking, studentName: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Name</label>
                                    <input required type="text" placeholder="e.g. Ahmed Khan" className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase text-slate-700"
                                        onChange={e => setNewBooking({ ...newBooking, fatherName: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subjects</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {subjectsList.map(sub => (
                                        <button
                                            key={sub}
                                            type="button"
                                            onClick={() => toggleSubject(sub)}
                                            className={`p-5 rounded-2xl border-2 transition-all duration-300 text-xs font-black uppercase flex justify-between items-center ${newBooking.selectedSubjects.includes(sub)
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md translate-y-[-2px]'
                                                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            {sub}
                                            {newBooking.selectedSubjects.includes(sub) ? <CheckCircle size={18} fill="currentColor" className="text-white" /> : <ChevronRight size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fee Receipt Amount</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600">
                                        <DollarSign size={24} />
                                    </div>
                                    <input required type="number" placeholder="0000" className="w-full p-6 pl-16 bg-emerald-50 border-none rounded-3xl outline-none text-emerald-700 font-black text-2xl placeholder:text-emerald-200"
                                        onChange={e => setNewBooking({ ...newBooking, examFees: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-indigo-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-3">
                                <Save size={22} /> Confirm & Save Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}