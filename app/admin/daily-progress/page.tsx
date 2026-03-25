"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import {
    Loader2, Send, PhoneCall, Users, Calendar,
    Search, TrendingUp, Clock, User, Trash2, Edit3, X, Check
} from 'lucide-react';
import { format, startOfWeek, startOfMonth } from 'date-fns';

export default function DailyProgress() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [reports, setReports] = useState([]);
    const [filterType, setFilterType] = useState('daily');
    const [searchName, setSearchName] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);

    // Custom Date Range States
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [formData, setFormData] = useState({
        agentName: '',
        leadsCalling: 0,
        studentVisits: 0,
        appointments: 0,
        otherWork: ''
    });

    // --- Data Fetching ---
    const fetchReports = async () => {
        setFetching(true);
        try {
            const params: any = {};
            if (searchName) params.name = searchName;

            let sDate = startDate;
            let eDate = endDate;

            if (filterType === 'daily') {
                sDate = format(new Date(), 'yyyy-MM-dd');
                eDate = format(new Date(), 'yyyy-MM-dd');
            } else if (filterType === 'weekly') {
                sDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
                eDate = format(new Date(), 'yyyy-MM-dd');
            } else if (filterType === 'monthly') {
                sDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
                eDate = format(new Date(), 'yyyy-MM-dd');
            }

            if (sDate) params.startDate = sDate;
            if (eDate) params.endDate = eDate;

            const res = await api.get('/progress/all', { params });
            setReports(res.data);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filterType, startDate, endDate]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchReports();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchName]);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.name) setFormData(prev => ({ ...prev, agentName: user.name }));
            }
        } catch (err) {
            console.error("Error parsing user from localStorage", err);
        }
    }, []);

    const summary = useMemo(() => {
        return reports.reduce((acc, curr: any) => ({
            totalCalls: acc.totalCalls + (Number(curr.leadsCalling) || 0),
            totalVisits: acc.totalVisits + (Number(curr.studentVisits) || 0),
            totalApps: acc.totalApps + (Number(curr.appointments) || 0),
        }), { totalCalls: 0, totalVisits: 0, totalApps: 0 });
    }, [reports]);

    // --- Action Handlers ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('user');
        if (!storedUser || storedUser === "undefined") {
            alert("❌ Session Error: Please login again.");
            return;
        }

        const user = JSON.parse(storedUser);
        const userId = user._id || user.id;

        setLoading(true);
        try {
            await api.post('/progress/add', { ...formData, agentId: userId });
            alert("✅ Progress Saved!");
            setFormData({ ...formData, leadsCalling: 0, studentVisits: 0, appointments: 0, otherWork: '' });
            fetchReports();
        } catch (err: any) {
            alert(`❌ Submission failed: ${err.response?.data?.message || "Server Error"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/progress/delete/${id}`);
            setReports(reports.filter((r: any) => r._id !== id));
        } catch (err) {
            alert("❌ Failed to delete report");
        }
    };

    const startEditing = (report: any) => {
        setEditingId(report._id);
        setEditData({ ...report });
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await api.put(`/progress/update/${editingId}`, editData);
            setEditingId(null);
            fetchReports();
        } catch (err) {
            alert("❌ Failed to update report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800 space-y-8">

            {/* 1. TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Calls" value={summary.totalCalls} icon={<PhoneCall />} color="blue" />
                <SummaryCard title="Student Visits" value={summary.totalVisits} icon={<Users />} color="emerald" />
                <SummaryCard title="Appointments" value={summary.totalApps} icon={<Calendar />} color="purple" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 2. ADD PROGRESS FORM */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-gray-200 h-fit shadow-sm"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" /> New Report
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Agent Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text" required
                                    value={formData.agentName}
                                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-semibold"
                                    placeholder="Enter Agent Name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <InputField label="Calls" value={formData.leadsCalling} onChange={(v: number) => setFormData({ ...formData, leadsCalling: v })} />
                            <InputField label="Visits" value={formData.studentVisits} onChange={(v: number) => setFormData({ ...formData, studentVisits: v })} />
                            <InputField label="Apps" value={formData.appointments} onChange={(v: number) => setFormData({ ...formData, appointments: v })} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Other Work Details</label>
                            <textarea
                                value={formData.otherWork}
                                onChange={(e) => setFormData({ ...formData, otherWork: e.target.value })}
                                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 h-24 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none text-sm text-gray-700"
                                placeholder="Details about other tasks..."
                            />
                        </div>

                        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Report</>}
                        </button>
                    </form>
                </motion.div>

                {/* 3. REPORTS TABLE & FILTERS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="xl:col-span-2 bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col"
                >
                    <div className="p-6 border-b border-gray-100 space-y-4">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Clock size={20} className="text-blue-600" /> Activity Log</h2>
                            <div className="flex flex-wrap justify-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                                {['daily', 'weekly', 'monthly', 'custom'].map((t) => (
                                    <button
                                        key={t} onClick={() => setFilterType(t)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterType === t ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {filterType === 'custom' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="grid grid-cols-2 gap-4 overflow-hidden bg-blue-50/50 p-3 rounded-2xl border border-blue-100"
                                >
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">From</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border border-gray-200 rounded-xl p-2 text-sm focus:border-blue-500 outline-none shadow-sm" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">To</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border border-gray-200 rounded-xl p-2 text-sm focus:border-blue-500 outline-none shadow-sm" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder="Search by agent name..."
                                value={searchName} onChange={(e) => setSearchName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px]">
                        {fetching ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-3">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <p className="text-gray-400 font-medium animate-pulse">Syncing reports...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
                                    <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        <th className="p-5 pl-8">Agent Info</th>
                                        <th className="p-5 text-center">Calls</th>
                                        <th className="p-5 text-center">Visits</th>
                                        <th className="p-5 text-center">Apps</th>
                                        <th className="p-5">Task Details</th>
                                        <th className="p-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {reports.length > 0 ? reports.map((report: any, index) => (
                                        <tr key={report._id || index} className="hover:bg-gray-50/50 transition-colors group text-sm">
                                            <td className="p-5 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                                        {report.agentName?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{report.agentName}</p>
                                                        <p className="text-[11px] text-gray-400">
                                                            {report.date ? format(new Date(report.date), 'dd MMM, yyyy') :
                                                                report.createdAt ? format(new Date(report.createdAt), 'dd MMM, yyyy') : '---'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {editingId === report._id ? (
                                                <>
                                                    <td className="p-2"><input type="number" className="w-16 p-2 border rounded-lg text-center mx-auto block" value={editData.leadsCalling} onChange={e => setEditData({ ...editData, leadsCalling: e.target.value })} /></td>
                                                    <td className="p-2"><input type="number" className="w-16 p-2 border rounded-lg text-center mx-auto block" value={editData.studentVisits} onChange={e => setEditData({ ...editData, studentVisits: e.target.value })} /></td>
                                                    <td className="p-2"><input type="number" className="w-16 p-2 border rounded-lg text-center mx-auto block" value={editData.appointments} onChange={e => setEditData({ ...editData, appointments: e.target.value })} /></td>
                                                    <td className="p-2"><input type="text" className="w-full p-2 border rounded-lg" value={editData.otherWork} onChange={e => setEditData({ ...editData, otherWork: e.target.value })} /></td>
                                                    <td className="p-5 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={handleUpdate} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"><Check size={16} /></button>
                                                            <button onClick={() => setEditingId(null)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X size={16} /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-5 text-center font-bold text-blue-600 bg-blue-50/30">{report.leadsCalling}</td>
                                                    <td className="p-5 text-center font-bold text-emerald-600">{report.studentVisits}</td>
                                                    <td className="p-5 text-center font-bold text-purple-600 bg-purple-50/30">{report.appointments}</td>
                                                    <td className="p-5 text-gray-500 text-xs max-w-[200px] truncate" title={report.otherWork}>{report.otherWork || '---'}</td>
                                                    <td className="p-5 text-center">
                                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => startEditing(report)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                                <Edit3 size={16} />
                                                            </button>
                                                            <button onClick={() => handleDelete(report._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="p-20 text-center text-gray-400 font-medium italic">No reports found for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Sub-components
function SummaryCard({ title, value, icon, color }: any) {
    const iconColors: any = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        purple: 'text-purple-600 bg-purple-50'
    };
    return (
        <div className="bg-white border border-gray-100 p-7 rounded-[2rem] flex items-center justify-between shadow-sm group">
            <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-4xl font-black text-gray-900">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl transition-all group-hover:rotate-12 ${iconColors[color]}`}>
                {icon}
            </div>
        </div>
    );
}

function InputField({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
            <input
                type="number" value={value}
                min="0"
                onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none text-center font-bold text-gray-700 transition-all"
            />
        </div>
    );
}