"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    Search, Plus, X, TrendingUp, Wallet, Users,
    Eye, RefreshCcw, CreditCard,
    UserCheck, Clock, User, MapPin, GraduationCap, Calendar, AlertCircle, Loader2,
    ChevronLeft, ChevronRight
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AllFormsPage() {
    // --- STATES ---
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCSR, setSelectedCSR] = useState("All");
    const [isProcessing, setIsProcessing] = useState(false);

    // Pagination & Advanced Filters
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // --- FETCH DATA ---
    const fetchForms = useCallback(async () => {
        try {
            setLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const res = await axios.get(`${API_BASE_URL}/admin/forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data?.forms || (Array.isArray(res.data) ? res.data : []);
            setForms(data);
        } catch (err: any) {
            console.error("Fetch Error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    // --- DATE RANGE LOGIC ---
    const isWithinRange = (dateString: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        if (dateFilter === "today") return date.toDateString() === now.toDateString();
        if (dateFilter === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        }
        if (dateFilter === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (dateFilter === "custom" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59);
            return date >= start && date <= end;
        }
        return true;
    };

    // --- FILTER & STATS LOGIC ---
    const { filteredForms, stats, agentsList } = useMemo(() => {
        const agents = Array.from(new Set(forms.map(f => f.agentName || f.officeUse?.issuedBy || "Admin")));
        const filtered = forms.filter(f => {
            const agentName = (f.agentName || f.officeUse?.issuedBy || "Admin");
            const studentName = (f.studentName || "").toLowerCase();
            const createdAt = f.createdAt || f.date;
            const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || agentName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCSR = selectedCSR === "All" || agentName === selectedCSR;
            const matchesDate = dateFilter === "all" || isWithinRange(createdAt);
            return matchesSearch && matchesCSR && matchesDate;
        });

        let revenue = 0; let pending = 0;
        filtered.forEach(f => {
            const regFee = Number(f.officeUse?.registrationFee) || 0;
            const installmentsPaid = f.installments?.filter((i: any) => i.status === 'Paid').reduce((sum: number, h: any) => sum + (Number(h.amount) || 0), 0) || 0;
            const historyPaid = f.feeHistory?.reduce((sum: number, h: any) => sum + (Number(h.amountPaid) || 0), 0) || 0;
            revenue += (regFee + installmentsPaid + historyPaid);
            pending += (Number(f.officeUse?.balanceAmount) || 0);
        });

        return { filteredForms: filtered, stats: { total: filtered.length, revenue, pending }, agentsList: agents };
    }, [forms, searchTerm, selectedCSR, dateFilter, startDate, endDate]);

    const paginatedForms = filteredForms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredForms.length / itemsPerPage);

    const clearFilters = () => {
        setSearchTerm(""); setSelectedCSR("All"); setDateFilter("all");
        setStartDate(""); setEndDate(""); setCurrentPage(1);
    };

    const handleAddInstallment = async (studentId: string) => {
        const amount = prompt("Enter Installment Amount (PKR):");
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
        try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/admin/forms/${studentId}/installment`,
                { amount: Number(amount), amountPaid: Number(amount), paymentDate: new Date() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Payment Recorded!"); setShowModal(false); fetchForms();
        } catch (err: any) {
            alert(`❌ Failed: ${err.response?.data?.message || "Error"}`);
        } finally { setIsProcessing(false); }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-black font-sans selection:bg-blue-100">
            <div className="max-w-7xl mx-auto">

                {/* --- STATS SECTION --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-blue-600 flex items-center justify-between group transition-all hover:-translate-y-1">
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{selectedCSR === 'All' ? 'Total Students' : `${selectedCSR}'s Students`}</p>
                            <h3 className="text-4xl font-black mt-1">{stats.total}</h3>
                        </div>
                        <Users className="text-blue-100" size={60} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-green-500 flex items-center justify-between group transition-all hover:-translate-y-1">
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Revenue ({dateFilter})</p>
                            <h3 className="text-3xl font-black mt-1 text-green-600">Rs. {stats.revenue.toLocaleString()}</h3>
                        </div>
                        <TrendingUp className="text-green-100" size={60} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-red-500 flex items-center justify-between group transition-all hover:-translate-y-1">
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Outstanding Dues</p>
                            <h3 className="text-3xl font-black mt-1 text-red-600">Rs. {stats.pending.toLocaleString()}</h3>
                        </div>
                        <Wallet className="text-red-100" size={60} />
                    </div>
                </div>

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl gap-4">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Education Zone <span className="text-blue-500">ERP</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Centralized Management System</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Server Live</span>
                    </div>
                </div>

                {/* --- FILTERS --- */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg mb-8 border border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="relative lg:col-span-4">
                            <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search Student or Agent..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <select
                                value={selectedCSR}
                                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black outline-none h-full appearance-none cursor-pointer"
                                onChange={(e) => { setSelectedCSR(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="All">All CSRs</option>
                                {agentsList.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <select
                                value={dateFilter}
                                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black outline-none h-full appearance-none cursor-pointer"
                                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Date</option>
                            </select>
                        </div>
                        {dateFilter === "custom" && (
                            <div className="lg:col-span-3 flex gap-2">
                                <input type="date" className="bg-slate-100 p-2 rounded-xl text-xs font-bold w-full" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <input type="date" className="bg-slate-100 p-2 rounded-xl text-xs font-bold w-full" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        )}
                        <button onClick={clearFilters} className="lg:col-span-1 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                            <RefreshCcw size={20} />
                        </button>
                    </div>
                </div>

                {/* --- MAIN TABLE --- */}
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Architecture</th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Progress</th>
                                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-24 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Synchronizing...</td></tr>
                                ) : paginatedForms.length > 0 ? (
                                    paginatedForms.map((form) => (
                                        <tr key={form._id} className="hover:bg-blue-50/40 transition-all group">
                                            <td className="p-8">
                                                <p className="font-black text-slate-900 uppercase text-lg tracking-tighter">{form.studentName}</p>
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded uppercase">
                                                    {form.agentName || form.officeUse?.issuedBy || "Admin"}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                <p className="font-bold uppercase text-sm text-slate-700">{form.course}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{form.duration || 'Flexible'}</p>
                                            </td>
                                            <td className="p-8">
                                                <p className="font-black text-sm text-red-600 mb-2">Due: Rs. {Number(form.officeUse?.balanceAmount || 0).toLocaleString()}</p>
                                                <div className="w-full max-w-[150px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${Math.min(100, ((Number(form.officeUse?.totalFee || 0) - Number(form.officeUse?.balanceAmount || 0)) / (Number(form.officeUse?.totalFee) || 1)) * 100)}%` }} />
                                                </div>
                                            </td>
                                            <td className="p-8 text-center">
                                                <button onClick={() => { setSelectedStudent(form); setShowModal(true); }} className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] hover:bg-blue-600 transition-all uppercase tracking-widest shadow-lg">
                                                    <Eye size={16} /> Open Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="p-24 text-center text-slate-300 font-black uppercase tracking-widest">No Records Found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-8 bg-slate-50 border-t flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border rounded-xl disabled:opacity-30"><ChevronLeft size={20} /></button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border rounded-xl disabled:opacity-30"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 🟢 STUDENT PROFILE MODAL --- */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in duration-300">

                        {/* Modal Header */}
                        <div className={`p-10 text-white flex justify-between items-start ${selectedStudent.formType === 'DIB Education System' ? 'bg-indigo-950' : 'bg-orange-600'}`}>
                            <div className="flex items-center gap-8">
                                <div className="bg-white p-4 rounded-3xl shadow-2xl transform -rotate-6">
                                    <User className="text-slate-900" size={40} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{selectedStudent.studentName}</h2>
                                    <div className="flex flex-wrap gap-4 mt-3">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">ID: {selectedStudent._id.slice(-6).toUpperCase()}</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedStudent.formType}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-4 bg-white/10 rounded-full hover:bg-red-500 transition-all border border-white/20"><X size={24} /></button>
                        </div>

                        <div className="p-8 md:p-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-12 custom-scrollbar">

                            {/* LEFT: INFO */}
                            <div className="lg:col-span-7 space-y-12">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-[0.3em] border-b pb-4"><User size={16} className="text-blue-500" /> Biological Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 p-10 rounded-[3rem]">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Father's Name</p>
                                            <p className="font-black text-slate-800 uppercase text-lg">{selectedStudent.fatherName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity (CNIC)</p>
                                            <p className="font-black text-slate-800 text-lg">{selectedStudent.cnic}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone / Mobile</p>
                                            <p className="font-black text-blue-600 text-lg">{selectedStudent.mobileNo}</p>
                                        </div>
                                        <div className="col-span-full border-t pt-6">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest flex items-center gap-1"><MapPin size={12} /> Residence</p>
                                            <p className="font-bold text-slate-700 text-base">{selectedStudent.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-[0.3em] border-b pb-4"><GraduationCap size={16} className="text-purple-600" /> Academic Credentials</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50/50 border-2 border-blue-100 p-8 rounded-[2.5rem]">
                                            <p className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-[0.2em]">Secondary School</p>
                                            <p className="text-sm font-bold">Marks: {selectedStudent.qualification?.matric?.marks || 'N/A'}</p>
                                            <p className="text-sm font-bold">Board: {selectedStudent.qualification?.matric?.board || 'N/A'}</p>
                                        </div>
                                        <div className="bg-purple-50/50 border-2 border-purple-100 p-8 rounded-[2.5rem]">
                                            <p className="text-[10px] font-black text-purple-600 uppercase mb-4 tracking-[0.2em]">Higher Secondary</p>
                                            <p className="text-sm font-bold">Marks: {selectedStudent.qualification?.inter?.marks || 'N/A'}</p>
                                            <p className="text-sm font-bold">Board: {selectedStudent.qualification?.inter?.board || 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* RIGHT: LEDGER (RESTORED REG FEE & INSTALLMENTS PLAN) */}
                            <div className="lg:col-span-5 space-y-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.3em] border-b pb-4"><CreditCard size={16} className="text-green-600" /> Financial Audit</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fee</p>
                                        <p className="text-2xl font-black">Rs. {Number(selectedStudent.officeUse?.totalFee).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-red-600 text-white p-6 rounded-3xl shadow-xl">
                                        <p className="text-[8px] font-black text-red-100 uppercase tracking-widest mb-1">Outstanding</p>
                                        <p className="text-2xl font-black">Rs. {Number(selectedStudent.officeUse?.balanceAmount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl min-h-[400px]">
                                    <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction History</span>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase">
                                            <Clock size={10} /> {selectedStudent.officeUse?.noOfInstallments || 1} Plan
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                                        {/* Registration Fee Display */}
                                        <div className="flex justify-between items-center p-5 bg-blue-50/50 rounded-2xl border-l-4 border-blue-600 shadow-sm">
                                            <div>
                                                <p className="text-xs font-black uppercase text-slate-800">Registration Fee</p>
                                                <p className="text-[9px] font-bold text-blue-600/70 uppercase">Initial Enrollment</p>
                                            </div>
                                            <p className="font-black text-lg text-blue-700">Rs. {Number(selectedStudent.officeUse?.registrationFee).toLocaleString()}</p>
                                        </div>

                                        {/* Installments Mapping (Date wise & Status) */}
                                        {(selectedStudent.installments && selectedStudent.installments.length > 0) ? (
                                            selectedStudent.installments.map((inst: any, i: number) => (
                                                <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border-l-4 shadow-sm transition-all ${inst.status === 'Paid' ? 'bg-green-50 border-green-600' : 'bg-white border-slate-200'}`}>
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-slate-800">Installment #{i + 1}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                                                            Due: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-black text-lg ${inst.status === 'Paid' ? 'text-green-600' : 'text-slate-400'}`}>Rs. {Number(inst.amount).toLocaleString()}</p>
                                                        <span className={`text-[8px] font-black uppercase ${inst.status === 'Paid' ? 'text-green-500' : 'text-slate-300'}`}>{inst.status}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            /* Fallback for old manual history */
                                            selectedStudent.feeHistory?.map((h: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl border-l-4 border-green-500 shadow-sm">
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-slate-800">Payment Recieved</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(h.datePaid || h.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className="font-black text-lg text-green-600">+ Rs. {Number(h.amountPaid).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-8 bg-slate-50 border-t mt-auto">
                                        {Number(selectedStudent.officeUse?.balanceAmount) > 0 ? (
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => handleAddInstallment(selectedStudent._id)}
                                                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-blue-600 disabled:bg-slate-400 transition-all shadow-xl uppercase text-xs tracking-[0.2em]"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} Record Payment
                                            </button>
                                        ) : (
                                            <div className="w-full bg-green-600 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl uppercase text-xs tracking-[0.2em]">
                                                <UserCheck size={20} /> Account Settled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}