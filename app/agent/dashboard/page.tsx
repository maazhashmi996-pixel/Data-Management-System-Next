"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    School,
    GraduationCap,
    LogOut,
    User as UserIcon,
    Plus,
    Clock,
    ChevronRight,
    TrendingUp,
    FileText,
    Printer,
    X
} from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import AdmissionForm from '../../../Components/AdmissionForm'; // Make sure path is correct

export default function AgentDashboard() {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);

    const [agentName, setAgentName] = useState("Agent");
    const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
    const [recentForms, setRecentForms] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Print Logic
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: selectedStudent ? `Form_${selectedStudent.studentName}` : 'Student_Form',
    });

    const openStudentDetails = async (formId: string) => {
        try {
            const token = localStorage.getItem('token');
            // Hum detail API se poora data mangwayein ge (Qualification/OfficeUse ke liye)
            const res = await axios.get(`http://localhost:5000/api/agent/my-forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const student = res.data.data.find((f: any) => f._id === formId);
            setSelectedStudent(student);
            setIsModalOpen(true);
        } catch (err) {
            alert("Error fetching student details");
        }
    };

    const handleSelectForm = (type: string) => {
        router.push(`/agent/create-form?type=${encodeURIComponent(type)}`);
    };

    const handleLogout = () => {
        if (confirm("System se logout karna chahte hain?")) {
            localStorage.clear();
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row relative">

            {/* --- Main Content Area --- */}
            <main className="flex-1 p-4 md:p-10">

                {/* 1. Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <UserIcon size={30} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                                Welcome, {agentName}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium italic">Agent Enrollment Portal</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                    >
                        <LogOut size={18} /> Logout System
                    </button>
                </div>

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Forms</p>
                            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">This Month</p>
                            <p className="text-2xl font-black text-slate-800">{stats.thisMonth}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status</p>
                            <p className="text-lg font-bold text-green-400">Online & Secure</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* 3. Create New Buttons */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                            <Plus className="text-blue-600" /> Create New Enrollment
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleSelectForm('Education Zone')} className="group bg-white p-6 rounded-3xl shadow-sm border-l-[6px] border-orange-500 hover:shadow-xl transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                                        <School size={32} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-lg text-slate-800 uppercase">Education Zone</h3>
                                        <p className="text-xs text-slate-500 italic">Open Enrollment Form</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-orange-500" />
                            </button>

                            <button onClick={() => handleSelectForm('DIB Education System')} className="group bg-white p-6 rounded-3xl shadow-sm border-l-[6px] border-blue-600 hover:shadow-xl transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-lg text-slate-800 uppercase">DIB Education</h3>
                                        <p className="text-xs text-slate-500 italic">Technical Admission Form</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-600" />
                            </button>
                        </div>
                    </div>

                    {/* 4. Recent Activity List */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="font-black text-slate-800 text-lg uppercase mb-6 tracking-tight">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentForms.length > 0 ? (
                                recentForms.map((form: any) => (
                                    <div
                                        key={form._id}
                                        onClick={() => openStudentDetails(form._id)}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${form.formType.includes('Zone') ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{form.studentName}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{form.course}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400">{form.date}</p>
                                                <p className="text-[9px] font-black text-blue-600 uppercase">{form.regNo}</p>
                                            </div>
                                            <Printer size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 italic py-10">No records found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- 5. VIEW & PRINT MODAL --- */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-100 w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-white p-6 flex justify-between items-center border-b shadow-sm">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    Form Preview: {selectedStudent.studentName}
                                </h2>
                                <p className="text-xs text-slate-500 font-bold">Reg No: {selectedStudent.regNo}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                                >
                                    <Printer size={18} /> Print Form
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body (Scrollable Form) */}
                        <div className="flex-1 overflow-y-auto p-10 bg-slate-200/50">
                            <div className="shadow-2xl mx-auto">
                                <AdmissionForm
                                    ref={componentRef}
                                    data={selectedStudent}
                                    type={selectedStudent.formType}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}