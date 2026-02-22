"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import api from '@/lib/axios';
import {
    Users, FileText, Printer, Trash2, Search, PlusCircle,
    LayoutDashboard, X, Eye, Calendar,
    GraduationCap, RefreshCcw, Edit3, Layers,
    XCircle, CheckCircle, ChevronLeft, ChevronRight, Mail, Lock, Unlock
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/navigation';
import AdmissionForm from '../../../Components/AdmissionForm';
import AssignTeacherModal from '../../../Components/AssignTeacherModal';
import { toast } from 'react-hot-toast';

// --- INTERFACES ---
interface AssignedSubject {
    subjectName: string;
    teacherId: string | { _id: string; name: string };
    teacherName?: string;
    status?: string;
}

interface Form {
    _id: string;
    studentName: string;
    fatherName?: string;
    course?: string;
    formType: 'Education Zone' | 'DIB Education System';
    regNo?: string;
    assignedTeacher?: { _id: string; name: string };
    assignedSubjects?: AssignedSubject[];
    cnic?: string;
    status?: string;
    createdAt: string;
}

interface Agent {
    _id: string;
    name: string;
    email: string;
    isBlocked: boolean;
    formsCount: number;
}

interface Teacher {
    _id: string;
    name: string;
    email: string;
    specialization: string;
    assignedStudentsCount: number;
}

interface Stats {
    totalForms: number;
    totalAgents: number;
    totalTeachers: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'students' | 'agents' | 'teachers'>('students');
    const [stats, setStats] = useState<Stats | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filteredForms, setFilteredForms] = useState<Form[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'All' | 'Education Zone' | 'DIB Education System'>('All');

    const [statusFilter, setStatusFilter] = useState<'All' | 'Pass' | 'Fail'>('All');
    const [timeFilter, setTimeFilter] = useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('All');
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState<Form | null>(null);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: printRef,
        documentTitle: `Form_${selectedForm?.studentName || 'Student'}`,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resStats, resForms, resAgents, resTeachers] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/forms'),
                api.get('/admin/agents'),
                api.get('/admin/teachers')
            ]);
            setStats(resStats.data);
            setForms(resForms.data.forms || []);
            setAgents(resAgents.data.agents || []);
            setTeachers(resTeachers.data.teachers || []);
        } catch (error) {
            toast.error("Data fetch karne mein masla hua");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- FILTERING ENGINE ---
    useEffect(() => {
        let results = [...forms];
        const now = new Date();

        if (timeFilter !== 'All') {
            results = results.filter(form => {
                const formDate = new Date(form.createdAt);
                if (timeFilter === 'Today') return formDate.toDateString() === now.toDateString();
                if (timeFilter === 'Week') {
                    const lastWeek = new Date();
                    lastWeek.setDate(now.getDate() - 7);
                    return formDate >= lastWeek;
                }
                if (timeFilter === 'Month') return formDate.getMonth() === now.getMonth() && formDate.getFullYear() === now.getFullYear();
                if (timeFilter === 'Custom' && startDate && endDate) {
                    const s = new Date(startDate); s.setHours(0, 0, 0, 0);
                    const e = new Date(endDate); e.setHours(23, 59, 59, 999);
                    return formDate >= s && formDate <= e;
                }
                return true;
            });
        }

        if (activeTab !== 'All') results = results.filter(f => f.formType === activeTab);

        if (statusFilter === 'Pass') {
            results = results.filter(f => f.assignedSubjects?.some(s => s.status === 'Pass'));
        } else if (statusFilter === 'Fail') {
            results = results.filter(f => f.assignedSubjects?.some(s => s.status === 'Fail'));
        }

        if (searchTerm) {
            results = results.filter(form =>
                form.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.cnic?.includes(searchTerm)
            );
        }

        setFilteredForms(results);
        setCurrentPage(1);
    }, [forms, timeFilter, activeTab, statusFilter, searchTerm, startDate, endDate]);

    const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredForms.slice(indexOfFirstItem, indexOfLastItem);

    const passCount = useMemo(() => forms.filter(f => f.assignedSubjects?.some(s => s.status === 'Pass')).length, [forms]);
    const failCount = useMemo(() => forms.filter(f => f.assignedSubjects?.some(s => s.status === 'Fail')).length, [forms]);

    const handleSubjectStatusChange = async (studentId: string, subjectName: string, newStatus: string) => {
        try {
            const res = await api.patch('/admin/update-student-subject', { studentId, subjectName, status: newStatus });
            if (res.data.success) {
                toast.success(`${subjectName} status updated`);
                setForms(prev => prev.map(f => f._id === studentId ? {
                    ...f, assignedSubjects: f.assignedSubjects?.map(s => s.subjectName === subjectName ? { ...s, status: newStatus } : s)
                } : f));
            }
        } catch (err) { toast.error("Sync failed!"); }
    };

    const deleteForm = async (id: string) => {
        if (window.confirm("Delete this record?")) {
            try { await api.delete(`/admin/delete-form/${id}`); toast.success("Deleted"); fetchData(); }
            catch (error) { toast.error("Failed!"); }
        }
    };

    const toggleAgentStatus = async (id: string) => {
        try {
            await api.patch(`/admin/agents/toggle-status/${id}`);
            toast.success("Agent status updated");
            fetchData();
        }
        catch (error) { toast.error("Toggle status failed!"); }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg rotate-3"><LayoutDashboard size={28} /></div>
                        ADMIN<span className="text-blue-600 font-light not-italic ml-1">CORE</span>
                    </h1>
                    <div className="flex gap-2 mt-4 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        {(['students', 'agents', 'teachers'] as const).map((mode) => (
                            <button key={mode} onClick={() => { setViewMode(mode); setSearchTerm(""); }} className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{mode}</button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* CUSTOM DATE INPUTS - Only visible when Custom is selected */}
                    {timeFilter === 'Custom' && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-[10px] font-bold outline-none p-1" />
                            <span className="text-slate-300 text-xs">to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-[10px] font-bold outline-none p-1" />
                        </div>
                    )}

                    <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                        {(['All', 'Today', 'Week', 'Month', 'Custom'] as const).map((t) => (
                            <button key={t} onClick={() => setTimeFilter(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${timeFilter === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
                        ))}
                    </div>

                    <button onClick={() => router.push('/admin/agents/create-form')} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10">
                        <PlusCircle size={18} /> Create Student
                    </button>

                    <button onClick={fetchData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm"><RefreshCcw size={20} className={loading ? "animate-spin" : ""} /></button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><FileText /></div>
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-1">Total Students</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats?.totalForms || 0}</h3>
                </div>

                <div onClick={() => setStatusFilter(statusFilter === 'Pass' ? 'All' : 'Pass')} className={`cursor-pointer p-6 rounded-[2rem] border transition-all ${statusFilter === 'Pass' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100'}`}>
                    <div className={`w-10 h-10 ${statusFilter === 'Pass' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center mb-3`}><CheckCircle /></div>
                    <p className={`text-[9px] font-black uppercase mb-1 ${statusFilter === 'Pass' ? 'text-emerald-100' : 'text-slate-400'}`}>Pass Status</p>
                    <h3 className="text-3xl font-black">{passCount}</h3>
                </div>

                <div onClick={() => setStatusFilter(statusFilter === 'Fail' ? 'All' : 'Fail')} className={`cursor-pointer p-6 rounded-[2rem] border transition-all ${statusFilter === 'Fail' ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-slate-100'}`}>
                    <div className={`w-10 h-10 ${statusFilter === 'Fail' ? 'bg-white/20' : 'bg-red-50 text-red-600'} rounded-xl flex items-center justify-center mb-3`}><XCircle /></div>
                    <p className={`text-[9px] font-black uppercase mb-1 ${statusFilter === 'Fail' ? 'text-red-100' : 'text-slate-400'}`}>Fail Status</p>
                    <h3 className="text-3xl font-black">{failCount}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3"><Users /></div>
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-1">Agents</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats?.totalAgents || 0}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3"><GraduationCap /></div>
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-1">Faculty</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats?.totalTeachers || 0}</h3>
                </div>
            </div>

            {/* MAIN DATA TABLE */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            {viewMode === 'students' ? (
                                (['All', 'Education Zone', 'DIB Education System'] as const).map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'All' ? 'All Systems' : tab === 'Education Zone' ? 'EZ' : 'DIB'}</button>
                                ))
                            ) : <div className="px-6 py-2.5 text-[10px] font-black uppercase text-slate-600 bg-slate-100 rounded-xl">Managing {viewMode}</div>}
                        </div>
                    </div>

                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-5 top-4 text-slate-400" size={18} />
                        <input type="text" placeholder={`Search ${viewMode}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none shadow-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {viewMode === 'students' ? (
                                <tr>
                                    <th className="px-8 py-5">Identity</th>
                                    <th className="px-8 py-5">Course</th>
                                    <th className="px-8 py-5">Grading</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-8 py-5">Profile Info</th>
                                    <th className="px-8 py-5">Contact Details</th>
                                    <th className="px-8 py-5">Performance</th>
                                    <th className="px-8 py-5 text-right">Settings</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-32 text-center animate-pulse font-black text-slate-300 tracking-[0.5em]">SYNCHRONIZING...</td></tr>
                            ) : viewMode === 'students' ? (
                                currentStudents.map((form) => (
                                    <tr key={form._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${form.formType === 'Education Zone' ? 'bg-orange-500' : 'bg-blue-600'}`}>{form.studentName?.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none">{form.studentName}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">{form.regNo || 'PENDING'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> {form.course}</p>
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1.5"><Calendar size={12} /> {new Date(form.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2 max-w-[220px]">
                                                {form.assignedSubjects?.map((sub, idx) => (
                                                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase truncate max-w-[60px]">{sub.subjectName}</span>
                                                        <select value={sub.status || "Pending"} onChange={(e) => handleSubjectStatusChange(form._id, sub.subjectName, e.target.value)} className={`text-[9px] font-black px-2 py-1 rounded-lg border outline-none ${sub.status === 'Pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : sub.status === 'Fail' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Pass">Pass</option>
                                                            <option value="Fail">Fail</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => { setStudentToAssign(form); setShowAssignModal(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-emerald-600 shadow-sm"><Layers size={16} /></button>
                                                <button onClick={() => router.push(`/admin/forms/edit/${form._id}`)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-amber-600 shadow-sm"><Edit3 size={16} /></button>
                                                <button onClick={() => { setSelectedForm(form); setIsPreviewOpen(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm"><Eye size={16} /></button>
                                                <button onClick={() => deleteForm(form._id)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-red-600 shadow-sm"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : viewMode === 'agents' ? (
                                filteredAgents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${agent.isBlocked ? 'bg-red-500' : 'bg-indigo-600'}`}>{agent.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none">{agent.name}</p>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${agent.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {agent.isBlocked ? 'Blocked' : 'Active Agent'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {agent.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                                                    <p className="text-[10px] text-indigo-400 font-black uppercase">Submissions</p>
                                                    <p className="text-xl font-black text-indigo-700">{agent.formsCount}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => toggleAgentStatus(agent._id)} className={`p-3 rounded-xl transition-all ${agent.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                                {agent.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg bg-emerald-600">{teacher.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none">{teacher.name}</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">{teacher.specialization}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {teacher.email}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="px-4 py-2 bg-emerald-50 rounded-xl inline-block">
                                                <p className="text-[10px] text-emerald-400 font-black uppercase">Students</p>
                                                <p className="text-xl font-black text-emerald-700">{teacher.assignedStudentsCount}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600"><Edit3 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {viewMode === 'students' && totalPages > 1 && (
                    <div className="p-8 border-t flex justify-between items-center bg-slate-50/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showAssignModal && studentToAssign && (
                <AssignTeacherModal student={studentToAssign} onClose={() => { setShowAssignModal(false); setStudentToAssign(null); }} onSuccess={() => { setShowAssignModal(false); setStudentToAssign(null); fetchData(); }} />
            )}

            {isPreviewOpen && selectedForm && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3rem] overflow-hidden flex flex-col">
                        <div className="p-8 border-b flex justify-between items-center bg-white">
                            <h2 className="font-black uppercase text-2xl text-slate-800">Preview & Print</h2>
                            <div className="flex gap-4">
                                <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-lg"><Printer size={16} /> Print</button>
                                <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                            <AdmissionForm ref={printRef} data={selectedForm} type={selectedForm.formType} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}