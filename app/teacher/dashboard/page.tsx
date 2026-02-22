"use client";
import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/axios';
import {
    BookOpen, Users, GraduationCap, LogOut,
    Search, RefreshCcw, Clock, ChevronRight,
    CheckCircle, XCircle, AlertCircle,
    ChevronLeft, ChevronLast, ChevronFirst
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [teacherInfo, setTeacherInfo] = useState({
        name: "Loading...",
        email: "",
    });

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Ek page par kitne students dikhane hain

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/teacher/my-students');
            if (res.data.success) {
                setStudents(res.data.students || []);
                if (res.data.teacher) setTeacherInfo(res.data.teacher);
            }
        } catch (err: any) {
            console.error("Dashboard Fetch Error:", err);
            toast.error("Data synchronization failed");
            if (err.response?.status === 401) router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = useMemo(() => {
        const total = students.length;
        const passed = students.filter(s =>
            s.teachingSubjects?.length > 0 &&
            s.teachingSubjects.every((sub: any) => sub.status === 'Pass')
        ).length;
        const failed = students.filter(s =>
            s.teachingSubjects?.some((sub: any) => sub.status === 'Fail')
        ).length;
        const pending = total - (passed + failed);
        return { total, passed, failed, pending };
    }, [students]);

    const handleSubjectStatusChange = async (studentId: string, subjectId: string, subjectName: string, newStatus: string) => {
        try {
            setStudents(prev => prev.map(student => {
                if (student._id === studentId) {
                    const updatedSubjects = student.teachingSubjects.map((sub: any) => {
                        if (sub.subjectName === subjectName) {
                            return { ...sub, status: newStatus };
                        }
                        return sub;
                    });
                    return { ...student, teachingSubjects: updatedSubjects };
                }
                return student;
            }));

            const res = await api.patch('/teacher/update-subject-status', {
                studentId,
                subjectName,
                status: newStatus
            });

            if (res.data.success) {
                toast.success(`${subjectName} marked as ${newStatus}`);
            } else {
                throw new Error("Failed to save");
            }
        } catch (err: any) {
            console.error("Status Update Error:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Failed to update status");
            fetchDashboardData();
        }
    };

    const filteredStudents = useMemo(() => {
        const filtered = students.filter((s: any) => {
            const name = (s.studentName || "").toLowerCase();
            const course = (s.course || "").toLowerCase();
            const reg = (s.regNo || "").toLowerCase();
            const search = searchTerm.toLowerCase();

            const matchesSearch = name.includes(search) || course.includes(search) || reg.includes(search);

            const isPassed = s.teachingSubjects?.length > 0 && s.teachingSubjects.every((sub: any) => sub.status === 'Pass');
            const isFailed = s.teachingSubjects?.some((sub: any) => sub.status === 'Fail');

            if (statusFilter === "Pass") return matchesSearch && isPassed;
            if (statusFilter === "Fail") return matchesSearch && isFailed;
            if (statusFilter === "Pending") return matchesSearch && !isPassed && !isFailed;

            return matchesSearch;
        });

        // Reset to first page when filter/search changes
        return filtered;
    }, [searchTerm, students, statusFilter]);

    // --- NEW: PAGINATION LOGIC ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
        toast.success("Logged out successfully");
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans antialiased">
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-2 rounded-lg text-white">
                            <BookOpen size={20} />
                        </div>
                        <h1 className="font-black tracking-tighter text-xl uppercase italic">
                            Nexus<span className="not-italic font-light text-slate-400">Edu</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Faculty Portal</span>
                            <span className="text-sm font-bold text-slate-900">{teacherInfo.name}</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase hover:bg-red-100 transition-all">
                            <LogOut size={14} /> Exit System
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto px-8 py-12">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">My Students</h2>
                        <p className="text-slate-500 font-medium italic">Overview of your assigned classes and student progress.</p>
                    </div>
                    <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh Records
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Students', value: stats.total, icon: Users, color: 'slate', key: 'All' },
                        { label: 'Cleared (Pass)', value: stats.passed, icon: CheckCircle, color: 'emerald', key: 'Pass' },
                        { label: 'Academic Risk (Fail)', value: stats.failed, icon: XCircle, color: 'red', key: 'Fail' },
                        { label: 'In Progress', value: stats.pending, icon: AlertCircle, color: 'amber', key: 'Pending' }
                    ].map((card) => (
                        <button
                            key={card.key}
                            onClick={() => setStatusFilter(card.key)}
                            className={`p-6 rounded-3xl border transition-all text-left shadow-sm bg-white ${statusFilter === card.key ? 'ring-2 ring-slate-900 border-transparent' : 'border-slate-200 hover:border-slate-400'}`}
                        >
                            <div className={`mb-4 ${card.key === 'Pass' ? 'text-emerald-500' : card.key === 'Fail' ? 'text-red-500' : card.key === 'Pending' ? 'text-amber-500' : 'text-slate-900'}`}>
                                <card.icon size={24} />
                            </div>
                            <div className="text-2xl font-black text-slate-900">{card.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</div>
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-slate-900 transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:border-slate-900 transition-all"
                        >
                            <option value="All">All Records</option>
                            <option value="Pass">Pass Only</option>
                            <option value="Fail">Fail Only</option>
                            <option value="Pending">Pending Only</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Profile</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Program & Duration</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Teaching Subjects & Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Final Result</th>
                                    <th className="px-8 py-5 border-b border-slate-100"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-32 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</td></tr>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((student) => (
                                        <tr key={student._id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase">
                                                        {student.studentName?.charAt(0) || "S"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 uppercase">{student.studentName}</div>
                                                        <div className="text-[10px] font-bold text-blue-600 uppercase">ID: {student.regNo || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-800 uppercase">{student.course}</span>
                                                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                        <Clock size={12} />
                                                        <span className="text-[10px] font-black uppercase">{student.duration || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-3">
                                                    {student.teachingSubjects?.map((sub: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-xl border border-slate-200/50">
                                                            <span className="text-[10px] font-black text-slate-700 uppercase min-w-[80px]">
                                                                {sub.subjectName}
                                                            </span>
                                                            <select
                                                                value={sub.status}
                                                                onChange={(e) => handleSubjectStatusChange(student._id, sub.subjectId, sub.subjectName, e.target.value)}
                                                                className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border outline-none ${sub.status === 'Pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : sub.status === 'Fail' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Pass">Pass</option>
                                                                <option value="Fail">Fail</option>
                                                            </select>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {student.teachingSubjects?.some((sub: any) => sub.status === 'Fail') ? (
                                                    <span className="text-[9px] font-black px-3 py-1.5 rounded-full border border-red-100 bg-red-50 text-red-600 uppercase">Fail</span>
                                                ) : student.teachingSubjects?.every((sub: any) => sub.status === 'Pass') ? (
                                                    <span className="text-[9px] font-black px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 uppercase">Pass</span>
                                                ) : (
                                                    <span className="text-[9px] font-black px-3 py-1.5 rounded-full border border-amber-100 bg-amber-50 text-amber-600 uppercase">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <ChevronRight size={18} className="inline text-slate-300 group-hover:text-slate-900 transition-colors" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="py-24 text-center text-xs font-black uppercase text-slate-400">No matching records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- NEW: PAGINATION UI --- */}
                    {!loading && filteredStudents.length > 0 && (
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} Students
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronFirst size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className="flex items-center gap-1 mx-2">
                                    {[...Array(totalPages)].map((_, i) => {
                                        // Dikhane ke liye sirf current page ke aas paas ke numbers
                                        if (i + 1 === currentPage || i + 1 === 1 || i + 1 === totalPages) {
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
                                                >
                                                    {i + 1}
                                                </button>
                                            )
                                        }
                                        if (i + 1 === currentPage - 1 || i + 1 === currentPage + 1) {
                                            return <span key={i} className="text-slate-300">.</span>
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all"
                                >
                                    <ChevronLast size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}