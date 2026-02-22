"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import {
    Users, Plus, Search, Edit3,
    GraduationCap, Mail, Phone, Loader2, BookOpen, ShieldCheck
} from 'lucide-react';

// Interface updated to match Backend "expertise" field
interface Teacher {
    _id: string;
    name: string;
    email: string;
    phone: string;
    expertise?: string[]; // Change: Match backend field name
    status: 'Active' | 'On Leave' | 'Resigned';
    salary?: number;
    cnic?: string;
}

export default function FacultyDirectory() {
    const router = useRouter();
    const [faculty, setFaculty] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await api.get('/admin/teachers');
                // Backend returns { success: true, teachers: [...] }
                const data = res.data.teachers || res.data;
                setFaculty(Array.isArray(data) ? data : []);
            } catch (err) {
                toast.error("Faculty data fetch nahi ho saka");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    // Filter logic updated for 'expertise'
    const filteredFaculty = faculty.filter((f: Teacher) =>
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.expertise?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Syncing Staff Records...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black italic text-slate-900 flex items-center gap-4 tracking-tighter">
                            <Users className="text-emerald-500" size={40} />
                            FACULTY <span className="text-emerald-500 not-italic">DIRECTORY</span>
                        </h1>
                        <p className="text-slate-500 font-bold mt-2 ml-1 text-[10px] uppercase tracking-[0.2em]">Institutional Human Resources</p>
                    </div>

                    <button
                        onClick={() => router.push('/admin/teacher/create')}
                        className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black transition-all flex items-center gap-3 shadow-2xl active:scale-95 text-xs tracking-widest"
                    >
                        <Plus size={20} /> REGISTER TEACHER
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Search by faculty name or expert subjects..."
                        className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredFaculty.map((teacher: Teacher) => (
                        <div key={teacher._id} className="group bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all relative overflow-hidden flex flex-col justify-between min-h-[480px]">

                            <div className={`absolute top-8 left-8 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${teacher.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {teacher.status || 'Active'}
                            </div>

                            <button
                                onClick={() => router.push(`/admin/teacher/${teacher._id}`)}
                                className="absolute top-6 right-6 p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            >
                                <Edit3 size={18} />
                            </button>

                            <div className="flex flex-col items-center mt-10 gap-5 text-center">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-emerald-400 font-black text-4xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    {teacher.name?.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">{teacher.name}</h3>
                                    <p className="text-slate-400 font-bold text-[11px] mt-2 flex items-center justify-center gap-1 uppercase tracking-widest">
                                        <ShieldCheck size={12} className="text-emerald-500" /> Professional Faculty
                                    </p>
                                </div>

                                {/* Updated Expertise Mapping */}
                                <div className="w-full mt-2">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <BookOpen size={14} className="text-slate-300" />
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Expertise</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {teacher.expertise && teacher.expertise.length > 0 ? (
                                            teacher.expertise.map((sub, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:text-emerald-700 transition-colors"
                                                >
                                                    {sub}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-[10px] italic text-slate-300 font-bold uppercase">No subjects assigned</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-8 border-t border-slate-50 mt-8">
                                <div className="flex items-center gap-4 text-slate-500 font-bold group-hover:translate-x-1 transition-transform">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Mail size={14} />
                                    </div>
                                    <span className="truncate text-[12px]">{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 font-bold group-hover:translate-x-1 transition-transform delay-75">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Phone size={14} />
                                    </div>
                                    <span className="text-[12px]">{teacher.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFaculty.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 shadow-inner">
                        <Users className="mx-auto text-slate-100 mb-6" size={80} />
                        <p className="font-black text-slate-300 uppercase tracking-[0.5em] text-xs italic">No matching records</p>
                    </div>
                )}
            </div>
        </div>
    );
}