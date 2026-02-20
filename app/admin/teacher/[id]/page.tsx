"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
    ArrowLeft, Mail, Phone, MapPin, BookOpen,
    Users, Calendar, GraduationCap, CheckCircle,
    Clock, Star, ShieldCheck, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Student {
    _id: string;
    name: string;
    email: string;
    course: string;
    status: string;
}

interface TeacherDetails {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    department: string;
    address?: string;
    subjects: string[];
    students: Student[];
    joiningDate: string;
}

export default function TeacherProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<TeacherDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Backend API call to get specific teacher by ID
                const res = await api.get(`/admin/teacher/${id}`);
                if (res.data.success) {
                    setData(res.data.teacher);
                }
            } catch (err) {
                toast.error("Teacher records not found!");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Workload Data...</p>
        </div>
    );

    if (!data) return <div className="p-20 text-center font-bold">Teacher not found.</div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* 1. Header & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to Directory
                        </button>
                        <h1 className="text-5xl font-black tracking-tighter italic leading-none uppercase">
                            Teacher<span className="text-blue-600 not-italic ml-2">Profile</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                            <CheckCircle size={14} /> Active Faculty
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Basic Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -z-0"></div>

                            <div className="relative z-10 text-center lg:text-left">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-6 mx-auto lg:mx-0 shadow-xl">
                                    {data.name.charAt(0)}
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 uppercase leading-tight mb-2">{data.name}</h2>
                                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-8 italic">{data.specialization}</p>

                                <div className="space-y-4 border-t border-slate-50 pt-8">
                                    <div className="flex items-center gap-4 text-slate-500 hover:text-blue-600 transition-colors">
                                        <Mail size={18} className="shrink-0" />
                                        <p className="text-sm font-bold truncate">{data.email}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <Phone size={18} className="shrink-0" />
                                        <p className="text-sm font-bold">{data.phone || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <MapPin size={18} className="shrink-0" />
                                        <p className="text-sm font-bold">{data.address || 'Campus Block A'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <Calendar size={18} className="shrink-0" />
                                        <p className="text-sm font-bold">Joined: {new Date(data.joiningDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Students</p>
                                <p className="text-3xl font-black italic">{data.students?.length || 0}</p>
                            </div>
                            <div className="bg-blue-600 p-6 rounded-[2rem] text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Subjects</p>
                                <p className="text-3xl font-black italic">{data.subjects?.length || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Academic Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Section 1: Assigned Subjects */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Assigned Courses & Subjects</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.subjects?.map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Book size={16} />
                                        </div>
                                        <p className="font-bold text-slate-700 uppercase text-sm">{sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Student List (Enrolled with this teacher) */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Current Enrolled Students</h3>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batch</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-6 py-2">Student Name</th>
                                            <th className="px-6 py-2">Assigned Course</th>
                                            <th className="px-6 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.students?.length > 0 ? data.students.map((student) => (
                                            <tr key={student._id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 bg-white border-y border-l border-slate-50 rounded-l-2xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 bg-white border-y border-slate-50">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{student.course}</span>
                                                </td>
                                                <td className="px-6 py-4 bg-white border-y border-r border-slate-50 rounded-r-2xl">
                                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                                                        {student.status || 'Studying'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="text-center py-10 text-slate-300 font-bold italic">No students assigned to this teacher yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Choti si icon helper component
function Book({ size }: { size: number }) {
    return <BookOpen size={size} />;
}