"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
    BookOpen, Users, GraduationCap, LogOut,
    Search, Calendar, Hash, UserCircle,
    ArrowUpRight, RefreshCcw, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// 1. Student interface define ki taake TypeScript error na de
interface Student {
    _id: string;
    studentName: string;
    regNo: string;
    course: string;
    createdAt: string;
}

interface TeacherInfo {
    name: string;
    specialization: string;
}

export default function TeacherDashboard() {
    const router = useRouter();

    // 2. State ko types assign kar di hain
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
        name: "Teacher",
        specialization: "Faculty"
    });

    const fetchMyStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/teacher/my-students');
            if (res.data.success) {
                const studentData = res.data.students || [];
                setStudents(studentData);
                setFilteredStudents(studentData);
                if (res.data.teacher) setTeacherInfo(res.data.teacher);
            }
        } catch (err) {
            toast.error("Students load nahi ho sakay");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyStudents();
    }, []);

    // Search Logic (Ab yahan red lines nahi ayengi)
    useEffect(() => {
        const results = students.filter((s: Student) =>
            s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
        toast.success("Logged out successfully");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">
            {/* HEADER SECTION */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg rotate-3">
                            <BookOpen size={28} />
                        </div>
                        TEACHER<span className="text-emerald-600 font-light not-italic ml-1">PANEL</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2 ml-1">
                        Welcome back, {teacherInfo.name}
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchMyStudents}
                        className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm group"
                    >
                        <RefreshCcw size={20} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex-1 md:flex-none shadow-sm"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Assigned Students</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{students.length}</h3>
                        <span className="text-emerald-500 text-xs font-bold flex items-center gap-0.5"><ArrowUpRight size={14} /> Live</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <GraduationCap size={24} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Courses</p>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                        {/* Course count logic fixed with typing */}
                        {[...new Set(students.map((s: Student) => s.course))].length}
                    </h3>
                </div>

                <div className="bg-emerald-900 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-emerald-300 rounded-2xl flex items-center justify-center mb-4">
                            <UserCircle size={24} />
                        </div>
                        <p className="text-emerald-300/60 text-[10px] font-black uppercase tracking-widest mb-1">Department</p>
                        <h3 className="text-2xl font-black tracking-tight uppercase italic">{teacherInfo.specialization}</h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <BookOpen size={120} />
                    </div>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search student by name, reg no or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 focus:border-emerald-500 rounded-[1.5rem] text-sm font-bold outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-slate-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* TABLE */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Student Information</th>
                                <th className="px-8 py-6">Registration & ID</th>
                                <th className="px-8 py-6">Course Track</th>
                                <th className="px-8 py-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-black text-slate-300 uppercase tracking-[0.3em]">Syncing Classroom...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((s: Student) => (
                                    <tr key={s._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-lg group-hover:bg-emerald-600 transition-colors">
                                                    {s.studentName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{s.studentName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        Added: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                                                <Hash size={12} /> {s.regNo || 'NO-REG'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                {s.course}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                                                Active Student
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Users size={64} />
                                            <p className="text-xl font-black uppercase tracking-widest">No Students Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}