"use client";
import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import {
    Users, FileText, Printer, Trash2, Search, PlusCircle,
    LayoutDashboard, X, Eye, ShieldCheck,
    UserCog, GraduationCap, RefreshCcw, Edit3, UserPlus, BookOpen, Layers, ShieldAlert, CheckCircle2
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
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // MULTI-TEACHER ASSIGNMENT STATES
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
            setFilteredForms(resForms.data.forms || []);
            setAgents(resAgents.data.agents || []);
            setTeachers(resTeachers.data.teachers || []);
        } catch (error) {
            toast.error("Data fetch karne mein masla hua");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Student Filtering Logic
    useEffect(() => {
        let results = forms;
        if (activeTab !== 'All') results = results.filter(f => f.formType === activeTab);
        if (searchTerm) {
            results = results.filter(form =>
                form.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.cnic?.includes(searchTerm)
            );
        }
        setFilteredForms(results);
    }, [searchTerm, forms, activeTab]);

    const deleteForm = async (id: string) => {
        if (window.confirm("Kiya aap waqai is student record ko delete karna chahte hain?")) {
            try {
                await api.delete(`/admin/delete-form/${id}`);
                toast.success("Record deleted");
                fetchData();
            } catch (error) {
                toast.error("Delete failed!");
            }
        }
    }

    // --- FIX 404 & SYNC WITH BACKEND ---
    const toggleAgentStatus = async (id: string) => {
        try {
            // Path synced with backend: router.patch('/agents/toggle-status/:id')
            await api.patch(`/admin/agents/toggle-status/${id}`);
            toast.success("Status successfully updated");
            fetchData();
        } catch (error) {
            toast.error("Status update failed!");
        }
    };

    const deleteTeacher = async (id: string) => {
        if (window.confirm("Delete this teacher?")) {
            try {
                // Path synced with backend: router.delete('/delete-teacher/:id')
                await api.delete(`/admin/delete-teacher/${id}`);
                toast.success("Teacher removed");
                fetchData();
            } catch (error) {
                toast.error("Error deleting teacher");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">
            {/* HEADER SECTION */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg rotate-3">
                            <LayoutDashboard size={28} />
                        </div>
                        ADMIN<span className="text-blue-600 font-light not-italic ml-1">CORE</span>
                    </h1>

                    <div className="flex gap-2 mt-4 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        {(['students', 'agents', 'teachers'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => { setViewMode(mode); setSearchTerm(""); }}
                                className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                    </button>

                    {viewMode === 'teachers' && (
                        <button onClick={() => router.push('/admin/teacher/create')} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all active:scale-95">
                            <UserPlus size={18} /> Add Teacher
                        </button>
                    )}

                    {viewMode === 'agents' && (
                        <button onClick={() => router.push('/admin/agents')} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all active:scale-95">
                            <UserPlus size={18} /> Create Agent
                        </button>
                    )}

                    {viewMode === 'students' && (
                        <button onClick={() => router.push('/admin/agents/create-form?type=Education Zone')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95">
                            <PlusCircle size={18} /> New Admission
                        </button>
                    )}
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Students', val: stats?.totalForms, icon: <FileText />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Agents', val: stats?.totalAgents, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Faculty Staff', val: stats?.totalTeachers, icon: <GraduationCap />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'System Status', val: 'Online', icon: <ShieldCheck />, color: 'text-slate-600', bg: 'bg-slate-50' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3 shadow-inner`}>{s.icon}</div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{s.val || 0}</h3>
                    </div>
                ))}
            </div>

            {/* MAIN TABLE CONTAINER */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-50/30">
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        {viewMode === 'students' ? (
                            (['All', 'Education Zone', 'DIB Education System'] as const).map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'All' ? 'View All' : tab === 'Education Zone' ? 'EZ Zone' : 'DIB System'}</button>
                            ))
                        ) : (
                            <div className="px-6 py-2.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Managing {viewMode}</div>
                        )}
                    </div>

                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-5 top-4 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${viewMode}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                {viewMode === 'students' && (
                                    <>
                                        <th className="px-8 py-5">Student Identity</th>
                                        <th className="px-8 py-5">Academic Details</th>
                                        <th className="px-8 py-5">Faculty / Subjects</th>
                                    </>
                                )}
                                {viewMode === 'agents' && (
                                    <>
                                        <th className="px-8 py-5">Agent Info</th>
                                        <th className="px-8 py-5">Performance</th>
                                        <th className="px-8 py-5">Account Status</th>
                                    </>
                                )}
                                {viewMode === 'teachers' && (
                                    <>
                                        <th className="px-8 py-5">Teacher Info</th>
                                        <th className="px-8 py-5">Specialization</th>
                                        <th className="px-8 py-5">Active Students</th>
                                    </>
                                )}
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-32 text-center animate-pulse font-black text-slate-300 tracking-[0.5em]">SYNCING...</td></tr>
                            ) : viewMode === 'students' ? (
                                filteredForms.map((form) => (
                                    <tr key={form._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${form.formType === 'Education Zone' ? 'bg-orange-500' : 'bg-blue-600'}`}>{form.studentName?.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none tracking-tight">{form.studentName}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">{form.regNo || 'PENDING'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> {form.course}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {form.assignedSubjects && form.assignedSubjects.length > 0 ? (
                                                    form.assignedSubjects.map((sub, idx) => (
                                                        <div key={idx} className="flex flex-col bg-slate-50 border border-slate-200 p-2 rounded-lg min-w-[120px]">
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub.subjectName}</span>
                                                            <span className="text-[10px] font-bold text-slate-700 truncate">{sub.teacherName || "Assigned"}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase">Not Assigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {/* FIX: Assign Click Handled */}
                                                <button onClick={() => { setStudentToAssign(form); setShowAssignModal(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-emerald-600 transition-all shadow-sm"><Layers size={16} /></button>
                                                <button onClick={() => router.push(`/admin/forms/edit/${form._id}`)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-amber-600 transition-all shadow-sm"><Edit3 size={16} /></button>
                                                <button onClick={() => { setSelectedForm(form); setIsPreviewOpen(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 transition-all shadow-sm"><Eye size={16} /></button>
                                                <button onClick={() => deleteForm(form._id)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-red-600 transition-all shadow-sm"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : viewMode === 'agents' ? (
                                agents.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map((agent) => (
                                    <tr key={agent._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg">{agent.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none tracking-tight">{agent.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{agent.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-slate-400" />
                                                <span className="text-xs font-black text-slate-700">{agent.formsCount} Forms</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {agent.isBlocked ?
                                                <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-lg">Deactivated</span> :
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-lg">Active Admin</span>
                                            }
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => toggleAgentStatus(agent._id)}
                                                    className={`p-2.5 border rounded-xl transition-all shadow-sm ${agent.isBlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white'}`}
                                                >
                                                    {agent.isBlocked ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                                                </button>
                                                {/* FIX: Edit Agent Path */}
                                                <button onClick={() => router.push(`/admin/agents/edit/${agent._id}`)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-amber-600 transition-all shadow-sm"><Edit3 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white shadow-lg">{teacher.name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none tracking-tight">{teacher.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{teacher.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-700 uppercase">{teacher.specialization}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{teacher.assignedStudentsCount || 0} Students</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                {/* FIX: Edit Teacher Path */}
                                                <button onClick={() => router.push(`/admin/teacher/edit/${teacher._id}`)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-amber-600 transition-all shadow-sm"><Edit3 size={16} /></button>
                                                <button onClick={() => deleteTeacher(teacher._id)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-red-600 transition-all shadow-sm"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALS */}
            {showAssignModal && studentToAssign && (
                <AssignTeacherModal
                    student={studentToAssign}
                    onClose={() => { setShowAssignModal(false); setStudentToAssign(null); }}
                    onSuccess={() => { setShowAssignModal(false); setStudentToAssign(null); fetchData(); }}
                />
            )}

            {isPreviewOpen && selectedForm && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3rem] overflow-hidden flex flex-col">
                        <div className="p-8 border-b flex justify-between items-center">
                            <h2 className="font-black uppercase text-2xl text-slate-800">Preview & Print</h2>
                            <div className="flex gap-4">
                                <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                    <Printer size={16} /> Print
                                </button>
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