"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    School,
    GraduationCap,
    LogOut,
    Plus,
    Clock,
    ChevronRight,
    TrendingUp,
    FileText,
    Printer,
    X,
    Search,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import AdmissionForm from '@/Components/AdmissionForm';

// Production API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AgentDashboard() {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [agentName, setAgentName] = useState("Agent");
    const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
    const [recentForms, setRecentForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal State
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoized Filtered Logic for Performance
    const filteredForms = useMemo(() => {
        return recentForms.filter((f: any) =>
            f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.regNo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recentForms, searchTerm]);

    const fetchDashboardData = useCallback(async () => {
        // Cancel previous request if any
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No token found");

            const res = await axios.get(`${API_BASE_URL}/agent/stats`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal
            });

            setStats(res.data.stats || { total: 0, thisMonth: 0 });
            setRecentForms(res.data.recentForms || []);
        } catch (err: any) {
            if (axios.isCancel(err)) return;
            console.error("Dashboard Data Error:", err);
            if (err.response?.status === 401) handleLogout(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            try {
                const parsed = JSON.parse(userData);
                setAgentName(parsed.name || "Agent");
                fetchDashboardData();
            } catch (e) {
                handleLogout(true);
            }
        } else {
            router.push('/login');
        }

        return () => abortControllerRef.current?.abort();
    }, [fetchDashboardData]);

    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: componentRef,
        documentTitle: selectedStudent ? `Form_${selectedStudent.studentName}` : 'Student_Form',
    });

    const openStudentDetails = async (formId: string) => {
        try {
            setDetailsLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/agent/my-forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const student = res.data.data.find((f: any) => f._id === formId);
            if (student) {
                setSelectedStudent(student);
                setIsModalOpen(true);
            } else {
                alert("Form details not found.");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleLogout = (auto = false) => {
        if (auto || confirm("System se logout karna chahte hain?")) {
            localStorage.clear();
            router.replace('/login');
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
    const currentItems = useMemo(() => {
        const last = currentPage * itemsPerPage;
        const first = last - itemsPerPage;
        return filteredForms.slice(first, last);
    }, [filteredForms, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-x-hidden font-sans selection:bg-blue-100">
            {/* TOP NAVIGATION BAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">EZ</div>
                    <span className="font-black text-slate-800 tracking-tighter uppercase hidden md:block">Enrollment Portal</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Logged in as</p>
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{agentName}</p>
                    </div>
                    <button onClick={() => handleLogout(false)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group">
                        <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Dashboard Stats */}
                <section className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-6">Dashboard Summary</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={<FileText size={28} />} label="Total Enrollments" value={stats.total} color="orange" />
                        <StatCard icon={<TrendingUp size={28} />} label="New This Month" value={stats.thisMonth} color="blue" />
                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-5 border border-slate-800">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Clock size={28} className="text-blue-400" /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Status</p>
                                <p className="text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active & Sync
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Side: New Entry */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" /> New Entry
                        </h2>
                        <EntryButton
                            onClick={() => router.push(`/agent/new-form?type=Education Zone`)}
                            icon={<School size={36} />}
                            title="Education Zone"
                            subtitle="Secondary & Higher Secondary"
                            borderColor="border-orange-500"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                            hoverBg="group-hover:bg-orange-500"
                        />
                        <EntryButton
                            onClick={() => router.push(`/agent/new-form?type=DIB Education System`)}
                            icon={<GraduationCap size={36} />}
                            title="DIB Education"
                            subtitle="Technical & Professional"
                            borderColor="border-indigo-700"
                            iconBg="bg-indigo-50"
                            iconColor="text-indigo-700"
                            hoverBg="group-hover:bg-indigo-700"
                        />
                    </div>

                    {/* Right Side: Recent Activity */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="font-black text-slate-800 text-xl uppercase tracking-tight">Recent Activity</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search name or ID..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        onChange={handleSearchChange}
                                        value={searchTerm}
                                    />
                                </div>
                            </div>

                            <div className="p-4 space-y-3 flex-1">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center py-20 space-y-4">
                                        <Loader2 className="animate-spin text-blue-600" size={40} />
                                        <p className="text-slate-400 font-bold animate-pulse">Syncing Records...</p>
                                    </div>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((form: any) => (
                                        <div
                                            key={form._id}
                                            onClick={() => openStudentDetails(form._id)}
                                            className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-xl hover:scale-[1.01] border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-12 rounded-full ${form.formType?.includes('Zone') ? 'bg-orange-400' : 'bg-indigo-600'}`} />
                                                <div>
                                                    <p className="font-black text-slate-800 text-lg uppercase leading-none mb-1">{form.studentName}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{form.course || 'General'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-black text-blue-600 uppercase">{form.regNo}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Today'}</p>
                                                </div>
                                                <div className="p-3 bg-white text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-2xl shadow-sm transition-all">
                                                    <Printer size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <FileText size={40} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-slate-400 font-bold italic">No records matching your search.</p>
                                    </div>
                                )}
                            </div>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <p className="text-xs font-bold text-slate-500">
                                        Showing {Math.min(filteredForms.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, filteredForms.length)} of {filteredForms.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-blue-50 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-blue-50 transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-200 w-full max-w-5xl h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white/20">
                        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-lg relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner ${selectedStudent.formType?.includes('Zone') ? 'bg-orange-500' : 'bg-indigo-800'}`}>
                                    {selectedStudent.formType?.includes('Zone') ? 'EZ' : 'DIB'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Preview</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Reg: {selectedStudent.regNo}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg uppercase text-xs tracking-widest transition-all active:scale-95">
                                    <Printer size={18} /> Print
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-300/40 custom-scrollbar">
                            <div className="scale-[0.9] origin-top md:scale-100 mb-20 transition-transform">
                                <div className="bg-white shadow-2xl mx-auto rounded-sm overflow-hidden min-h-[11in] w-full max-w-[8.5in]">
                                    <AdmissionForm ref={componentRef} data={selectedStudent} type={selectedStudent.formType} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- HELPER COMPONENTS FOR CLEANER CODE ---

function StatCard({ icon, label, value, color }: any) {
    const colors: any = {
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600"
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function EntryButton({ onClick, icon, title, subtitle, borderColor, iconBg, iconColor, hoverBg }: any) {
    return (
        <div onClick={onClick} className={`group cursor-pointer bg-white p-6 rounded-[2rem] border-l-[8px] ${borderColor} shadow-sm hover:shadow-xl transition-all active:scale-95`}>
            <div className="flex items-center gap-5">
                <div className={`w-16 h-16 ${iconBg} ${iconColor} rounded-3xl flex items-center justify-center ${hoverBg} group-hover:text-white transition-all shadow-sm`}>{icon}</div>
                <div className="flex-1">
                    <h3 className="font-black text-xl text-slate-800 uppercase">{title}</h3>
                    <p className="text-xs text-slate-500 italic">{subtitle}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
}