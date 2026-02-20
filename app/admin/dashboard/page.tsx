"use client";
import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import {
    Users, FileText, Printer, Trash2, Search, PlusCircle,
    LayoutDashboard, X, Eye, ShieldAlert, ShieldCheck,
    UserCog, GraduationCap, RefreshCcw, Edit3, UserPlus, BookOpen, Link2
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/navigation';
import AdmissionForm from '../../../Components/AdmissionForm';
import AssignTeacherModal from '../../../Components/AssignTeacherModal'; // Naya Import

// --- INTERFACES ---
interface Form {
    _id: string;
    studentName: string;
    fatherName?: string;
    cnic?: string;
    mobileNo?: string;
    address?: string;
    course?: string;
    duration?: string;
    marks?: string;
    year?: string;
    formType: 'Education Zone' | 'DIB Education System';
    agentId: { _id: string; name: string };
    assignedTeacher?: { _id: string; name: string };
    createdAt: string;
    regNo?: string;
    officeUse?: any;
    feeHistory?: any[];
    status?: string;
    date?: string;
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

    // --- NEW STATES FOR ASSIGN TEACHER ---
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
            const formsData = resForms.data.forms || resForms.data;
            setForms(Array.isArray(formsData) ? formsData : []);
            setFilteredForms(Array.isArray(formsData) ? formsData : []);

            const agentsData = resAgents.data.agents || resAgents.data;
            setAgents(Array.isArray(agentsData) ? agentsData : []);

            const teachersData = resTeachers.data.teachers || resTeachers.data;
            setTeachers(Array.isArray(teachersData) ? teachersData : []);

        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let results = forms;
        if (activeTab !== 'All') results = results.filter(f => f.formType === activeTab);
        if (searchTerm) {
            results = results.filter(form =>
                form.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.agentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                fetchData();
            } catch (error) {
                alert("Delete failed!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg rotate-3">
                            <LayoutDashboard size={28} />
                        </div>
                        ADMIN<span className="text-blue-600 font-light not-italic ml-1">CORE</span>
                    </h1>

                    <div className="flex gap-2 mt-4 bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                        <button onClick={() => setViewMode('students')} className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'students' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Students</button>
                        <button onClick={() => setViewMode('agents')} className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'agents' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Agents</button>
                        <button onClick={() => setViewMode('teachers')} className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'teachers' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Teachers</button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                    </button>

                    <button onClick={() => router.push('/admin/teachers/create')} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg transition-all active:scale-95">
                        <UserPlus size={18} /> Add Teacher
                    </button>

                    <button onClick={() => router.push('/admin/agents/create-form?type=Education Zone')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all active:scale-95">
                        <PlusCircle size={18} /> New Admission
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Students', val: stats?.totalForms, icon: <FileText />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Agents', val: stats?.totalAgents, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Teachers', val: teachers.length, icon: <BookOpen />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'System', val: 'Online', icon: <ShieldCheck />, color: 'text-slate-600', bg: 'bg-slate-50' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{s.val || 0}</h3>
                    </div>
                ))}
            </div>

            {/* MAIN TABLE */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-50/30">
                    {viewMode === 'students' && (
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            {['All', 'Education Zone', 'DIB Education System'].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'All' ? 'View All' : tab === 'Education Zone' ? 'EZ Zone' : 'DIB System'}</button>
                            ))}
                        </div>
                    )}
                    {viewMode === 'agents' && <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800 flex items-center gap-2"><UserCog className="text-blue-600" /> Agent Network</h2>}
                    {viewMode === 'teachers' && <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800 flex items-center gap-2"><BookOpen className="text-emerald-600" /> Faculty Directory</h2>}

                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-5 top-4 text-slate-400" size={18} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {viewMode === 'students' ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Student Identity</th>
                                    <th className="px-8 py-5">Academic Details</th>
                                    <th className="px-8 py-5">Assigned Teacher</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-32 text-center animate-pulse font-black text-slate-300 tracking-[0.5em]">SYNCING...</td></tr>
                                ) : filteredForms.map((form) => (
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
                                            <span className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5"><GraduationCap size={14} /> {form.course}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {form.assignedTeacher ? (
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase border border-emerald-100">
                                                    {form.assignedTeacher.name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg uppercase">Not Assigned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* MODIFIED ASSIGN BUTTON */}
                                                <button
                                                    onClick={() => {
                                                        setStudentToAssign(form);
                                                        setShowAssignModal(true);
                                                    }}
                                                    title="Assign Teacher"
                                                    className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-emerald-600 hover:border-emerald-500 transition-all"
                                                >
                                                    <Link2 size={16} />
                                                </button>
                                                <button onClick={() => router.push(`/admin/forms/edit/${form._id}`)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-amber-600 hover:border-amber-500 transition-all"><Edit3 size={16} /></button>
                                                <button onClick={() => { setSelectedForm(form); setIsPreviewOpen(true); }} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 hover:border-blue-500 transition-all"><Eye size={16} /></button>
                                                <button onClick={() => deleteForm(form._id)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-red-600 hover:border-red-500 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : viewMode === 'teachers' ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Teacher Profile</th>
                                    <th className="px-8 py-5">Specialization</th>
                                    <th className="px-8 py-5">Assigned Students</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {teachers.map((teacher) => (
                                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-all">
                                        <td className="px-8 py-6 font-black text-slate-800 uppercase flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs">{teacher.name.charAt(0)}</div>
                                            <div>
                                                <p>{teacher.name}</p>
                                                <p className="text-[10px] text-slate-400 lowercase italic font-normal">{teacher.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-500 italic">{teacher.specialization}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black text-xs">{teacher.assignedStudentsCount || 0} Students</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Agent Profile</th>
                                    <th className="px-8 py-5">Contact Info</th>
                                    <th className="px-8 py-5">Forms Registered</th>
                                    <th className="px-8 py-5 text-right">Access Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {agents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white">{agent.name.charAt(0)}</div>
                                                <p className="font-black text-slate-800 uppercase tracking-tight">{agent.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-bold text-xs italic">{agent.email}</td>
                                        <td className="px-8 py-6">
                                            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black text-xs">{agent.formsCount} Forms</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className={`ml-auto px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${agent.isBlocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {agent.isBlocked ? 'Blocked' : 'Active'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {isPreviewOpen && selectedForm && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b flex justify-between items-center">
                            <h2 className="font-black uppercase text-2xl text-slate-800">Preview & Print</h2>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                            <AdmissionForm ref={printRef} data={selectedForm} type={selectedForm.formType} />
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGN TEACHER MODAL INTEGRATION */}
            {showAssignModal && studentToAssign && (
                <AssignTeacherModal
                    student={studentToAssign}
                    onClose={() => {
                        setShowAssignModal(false);
                        setStudentToAssign(null);
                    }}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}