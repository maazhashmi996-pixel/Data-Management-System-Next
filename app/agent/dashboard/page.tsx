"use client";
import React, { useEffect, useState, useRef } from 'react';
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
    ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import AdmissionForm from '@/Components/AdmissionForm';

export default function AgentDashboard() {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);

    const [agentName, setAgentName] = useState("Agent");
    const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
    const [recentForms, setRecentForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Ek page par kitne records dikhane hain

    // Modal State for View/Print
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userData && token) {
            const parsed = JSON.parse(userData);
            setAgentName(parsed.name || "Agent");
            fetchDashboardData();
        } else {
            router.push('/login');
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/agent/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data.stats);
            setRecentForms(res.data.recentForms);
        } catch (err) {
            console.error("Stats fetching error", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: componentRef,
        documentTitle: selectedStudent ? `Form_${selectedStudent.studentName}` : 'Student_Form',
    });

    const openStudentDetails = async (formId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/agent/my-forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const student = res.data.data.find((f: any) => f._id === formId);
            if (student) {
                setSelectedStudent(student);
                setIsModalOpen(true);
            }
        } catch (err) {
            alert("Error fetching student details");
        }
    };

    const handleSelectForm = (type: string) => {
        router.push(`/agent/new-form?type=${encodeURIComponent(type)}`);
    };

    const handleLogout = () => {
        if (confirm("System se logout karna chahte hain?")) {
            localStorage.clear();
            router.push('/login');
        }
    };

    // --- FILTER & PAGINATION LOGIC ---
    const filteredForms = recentForms.filter((f: any) =>
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.regNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredForms.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when searching
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative overflow-x-hidden font-sans">

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
                    <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">

                {/* Dashboard Stats */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-6">Dashboard Summary</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><FileText size={28} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Enrollments</p>
                                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><TrendingUp size={28} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">New This Month</p>
                                <p className="text-3xl font-black text-slate-900">{stats.thisMonth}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Clock size={28} className="text-blue-400" /></div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Status</p>
                                <p className="text-xl font-bold text-emerald-400 tracking-tight">Active & Sync</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Side: New Entry */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" /> New Entry
                        </h2>
                        <div onClick={() => handleSelectForm('Education Zone')} className="group cursor-pointer bg-white p-6 rounded-[2rem] border-l-[8px] border-orange-500 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all"><School size={36} /></div>
                                <div className="flex-1">
                                    <h3 className="font-black text-xl text-slate-800 uppercase">Education Zone</h3>
                                    <p className="text-xs text-slate-500 italic">Secondary & Higher Secondary</p>
                                </div>
                                <ChevronRight className="text-slate-300" />
                            </div>
                        </div>
                        <div onClick={() => handleSelectForm('DIB Education System')} className="group cursor-pointer bg-white p-6 rounded-[2rem] border-l-[8px] border-indigo-700 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-3xl flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-all"><GraduationCap size={36} /></div>
                                <div className="flex-1">
                                    <h3 className="font-black text-xl text-slate-800 uppercase">DIB Education</h3>
                                    <p className="text-xs text-slate-500 italic">Technical & Professional</p>
                                </div>
                                <ChevronRight className="text-slate-300" />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Recent Activity with Pagination */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="font-black text-slate-800 text-xl uppercase tracking-tight">Recent Activity</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-blue-500"
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            <div className="p-4 space-y-3 min-h-[400px]">
                                {loading ? (
                                    <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Fetching records...</div>
                                ) : currentItems.length > 0 ? (
                                    currentItems.map((form: any) => (
                                        <div
                                            key={form._id}
                                            onClick={() => openStudentDetails(form._id)}
                                            className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-lg border border-transparent transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-12 rounded-full ${form.formType.includes('Zone') ? 'bg-orange-400' : 'bg-indigo-600'}`} />
                                                <div>
                                                    <p className="font-black text-slate-800 text-lg uppercase leading-none mb-1">{form.studentName}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{form.course}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-black text-blue-600 uppercase">{form.regNo}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{form.date || 'Today'}</p>
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
                                        <p className="text-slate-400 font-bold italic">No records found.</p>
                                    </div>
                                )}
                            </div>

                            {/* PAGINATION CONTROLS */}
                            {totalPages > 1 && (
                                <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <p className="text-xs font-bold text-slate-500">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredForms.length)} of {filteredForms.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
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
                                            onClick={() => setCurrentPage(prev => prev + 1)}
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

            {/* VIEW & PRINT MODAL */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-200 w-full max-w-5xl h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative border-4 border-white/20">
                        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-lg relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${selectedStudent.formType.includes('Zone') ? 'bg-orange-500' : 'bg-indigo-800'}`}>
                                    {selectedStudent.formType.includes('Zone') ? 'EZ' : 'DIB'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Admission Form Preview</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">ID: {selectedStudent.regNo}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg uppercase text-xs tracking-widest">
                                    <Printer size={18} /> Print Now
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-red-600 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-slate-300/40">
                            <div className="scale-[0.85] origin-top md:scale-100 mb-20">
                                <div className="bg-white shadow-2xl mx-auto rounded-sm overflow-hidden">
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