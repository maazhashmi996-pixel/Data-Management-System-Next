"use client";
import React, { useEffect, useState, useRef, cloneElement, isValidElement } from 'react';
import axios from 'axios';
import {
    Users,
    FileText,
    Printer,
    Trash2,
    Search,
    PlusCircle,
    LayoutDashboard,
    X,
    Eye,
    ShieldAlert,
    ShieldCheck,
    UserCog,
    MapPin,
    GraduationCap
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/navigation';
import AdmissionForm from '../../../Components/AdmissionForm';

// --- UPDATED INTERFACE TO MATCH NEW FIELDS ---
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
    createdAt: string;
    regNo?: string;
}

interface Agent {
    _id: string;
    name: string;
    email: string;
    isBlocked: boolean;
    formsCount: number;
}

interface Stats {
    totalForms: number;
    totalAgents: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'students' | 'agents'>('students');
    const [stats, setStats] = useState<Stats | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredForms, setFilteredForms] = useState<Form[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'All' | 'Education Zone' | 'DIB Education System'>('All');
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: printRef,
        documentTitle: `Form_${selectedForm?.studentName || 'Student'}`,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [resStats, resForms, resAgents] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', { headers }),
                axios.get('http://localhost:5000/api/admin/forms', { headers }),
                axios.get('http://localhost:5000/api/admin/agents', { headers })
            ]);

            setStats(resStats.data);
            setForms(resForms.data);
            setFilteredForms(resForms.data);
            setAgents(resAgents.data);
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

    const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'unblock' : 'block';
        if (window.confirm(`Kiya aap is agent ko ${action} karna chahte hain?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.patch(`http://localhost:5000/api/admin/agent-status/${agentId}`,
                    { isBlocked: !currentStatus },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchData();
            } catch (error) {
                alert("Status update failed!");
            }
        }
    };

    const deleteForm = async (id: string) => {
        if (window.confirm("Kiya aap waqai is student record ko delete karna chahte hain?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/admin/delete-form/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
            } catch (error) {
                alert("Delete failed!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-900 font-sans">

            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg rotate-3">
                            <LayoutDashboard size={28} />
                        </div>
                        ADMIN<span className="text-blue-600 font-light not-italic ml-1">CORE</span>
                    </h1>
                    <div className="flex gap-2 mt-4 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setViewMode('students')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'students' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Student Records
                        </button>
                        <button
                            onClick={() => setViewMode('agents')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'agents' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Manage Agents
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/admin/agents/create-form?type=Education Zone')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all active:scale-95"
                >
                    <PlusCircle size={18} /> New Admission
                </button>
            </div>

            {/* --- STATS --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Enrolled Students', val: stats?.totalForms, icon: <FileText />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Partner Agents', val: stats?.totalAgents, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'System Status', val: 'Active', icon: <ShieldCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                            {s.icon}
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{s.val || 0}</h3>
                    </div>
                ))}
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                {/* Filters */}
                <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-8 bg-slate-50/30">
                    {viewMode === 'students' ? (
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto">
                            {['All', 'Education Zone', 'DIB Education System'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab === 'All' ? 'View All' : tab === 'Education Zone' ? 'EZ Zone' : 'DIB System'}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <h2 className="font-black text-xl uppercase tracking-tighter text-slate-800 flex items-center gap-2">
                            <UserCog className="text-blue-600" /> Agent Network
                        </h2>
                    )}

                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-5 top-4 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={viewMode === 'students' ? "Search name, CNIC or Reg..." : "Search agents..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-bold shadow-sm outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {viewMode === 'students' ? (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Student Identity</th>
                                    <th className="px-8 py-5">Academic Details</th>
                                    <th className="px-8 py-5">Agent Source</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-32 text-center animate-pulse font-black text-slate-300 tracking-[0.5em]">SYNCING DATABASE...</td></tr>
                                ) : filteredForms.map((form) => (
                                    <tr key={form._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${form.formType === 'Education Zone' ? 'bg-orange-500' : 'bg-blue-600'}`}>
                                                    {form.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 uppercase leading-none tracking-tight">{form.studentName}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">{form.regNo || 'PENDING REG'}</p>
                                                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{form.cnic || 'CNIC Not Provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase">
                                                    <GraduationCap size={14} className="text-slate-400" /> {form.course}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                                    <MapPin size={10} /> {form.address?.substring(0, 25) || 'No Address'}...
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="bg-slate-100 px-4 py-2 rounded-xl inline-block">
                                                <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{form.agentId?.name}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Authorized</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedForm(form); setIsPreviewOpen(true); }}
                                                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-90"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteForm(form._id)}
                                                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-red-500 hover:text-red-600 transition-all shadow-sm active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        // AGENTS TABLE (Same Modern Style)
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Partner Name</th>
                                    <th className="px-8 py-5">Email Contact</th>
                                    <th className="px-8 py-5 text-center">Volume</th>
                                    <th className="px-8 py-5 text-center">Security Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {agents.map((agent) => (
                                    <tr key={agent._id} className="hover:bg-slate-50 transition-all">
                                        <td className="px-8 py-6 font-black text-slate-800 uppercase tracking-tight">{agent.name}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-500">{agent.email}</td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black text-xs">{agent.formsCount || 0}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleAgentStatus(agent._id, agent.isBlocked)}
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${agent.isBlocked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white'}`}
                                                >
                                                    {agent.isBlocked ? <><ShieldAlert size={14} /> Unblock Account</> : <><ShieldCheck size={14} /> Account Secure</>}
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

            {/* --- PREVIEW MODAL (MATCHES AGENT STYLE) --- */}
            {isPreviewOpen && selectedForm && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl scale-in">
                        <div className="p-8 border-b flex justify-between items-center bg-white">
                            <div>
                                <h2 className="font-black uppercase tracking-tighter text-2xl text-slate-800">Document Preview</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Student Admission Record</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handlePrint()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"><Printer size={16} /> Print Document</button>
                                <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                            <div className="max-w-[850px] mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm">
                                <AdmissionForm ref={printRef} data={selectedForm} type={selectedForm.formType} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}