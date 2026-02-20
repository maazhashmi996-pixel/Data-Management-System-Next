"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
    Users, Mail, Phone, BookOpen,
    Search, ArrowLeft, ShieldCheck,
    Trash2, Edit3, ExternalLink, GraduationCap,
    Clock, Book
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Faculty {
    _id: string;
    name: string;
    email: string;
    specialization: string;
    phone?: string;
    department?: string;
    // Naye fields jo workload dikhayenge
    assignedSubjects?: string[];
    activeStudentsCount?: number;
    currentBatch?: string;
}

export default function FacultyDirectory() {
    const router = useRouter();
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                // Backend se teachers ka data fetch karein
                const res = await api.get('/admin/teachers');
                if (res.data.success) {
                    setFaculty(res.data.teachers);
                }
            } catch (err) {
                toast.error("Faculty data load nahi ho saka");
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    const filteredFaculty = faculty.filter(f =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-xs uppercase mb-4 transition-all">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase italic">
                            FACULTY<span className="text-emerald-600 not-italic ml-2">OVERVIEW</span>
                        </h1>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search teacher or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:border-emerald-500 outline-none font-bold text-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Syncing academic records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {filteredFaculty.map((member) => (
                            <div key={member._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all group relative">

                                {/* Header Section */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-5 items-center">
                                        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black group-hover:bg-emerald-600 transition-all shadow-lg group-hover:-rotate-3">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 uppercase leading-tight">{member.name}</h3>
                                            <p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">{member.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-xl transition-colors">
                                            <Edit3 size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-xl transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                                            <Book size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Teaching Subjects</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {/* Dummy subjects display agar data na ho toh */}
                                            {member.assignedSubjects?.length ? member.assignedSubjects.map(sub => (
                                                <span key={sub} className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-700">{sub}</span>
                                            )) : (
                                                <span className="text-slate-400 text-xs italic font-bold">No subjects assigned</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                                        <div className="flex items-center gap-3 mb-2 text-slate-400">
                                            <GraduationCap size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Active Students</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-3xl font-black text-slate-800 leading-none">
                                                {member.activeStudentsCount || 0}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 ml-2">Enrolled</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Mini-Info */}
                                <div className="flex items-center justify-between px-2 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Mail size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{member.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Phone size={14} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-500">{member.phone || 'No Contact'}</p>
                                    </div>
                                </div>

                                {/* Full Review Action */}
                                <button
                                    onClick={() => router.push(`/admin/teacher/${member._id}`)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    Review Full Academic Workload <ExternalLink size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}