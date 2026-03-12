"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, Trash2, Edit, Plus, Filter, Users, DollarSign, Activity } from 'lucide-react';
import api from '@/lib/axios';

export default function AdminStudyAbroadDashboard() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'view'>('view');

    // Filters
    const [agentFilter, setAgentFilter] = useState("");
    const [dateRangeOption, setDateRangeOption] = useState("All");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [newComm, setNewComm] = useState("");

    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/study-abroad/all');
            if (res.data?.success) setData(res.data.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const itemDate = new Date(item.createdAt);
            const matchesAgent = item.agentId?.name?.toLowerCase().includes(agentFilter.toLowerCase());

            let matchesDate = true;
            const today = new Date();
            if (dateRangeOption === "Day") matchesDate = itemDate.toDateString() === today.toDateString();
            if (dateRangeOption === "Week") {
                const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7);
                matchesDate = itemDate >= weekAgo;
            }
            if (dateRangeOption === "Month") matchesDate = itemDate.getMonth() === today.getMonth();
            if (dateRangeOption === "Custom" && dateFrom && dateTo) {
                matchesDate = itemDate >= new Date(dateFrom) && itemDate <= new Date(dateTo);
            }
            return matchesAgent && matchesDate;
        });
    }, [data, agentFilter, dateRangeOption, dateFrom, dateTo]);

    const stats = useMemo(() => {
        return filteredData.reduce((acc, curr) => {
            acc.totalComm += (curr.adminControls?.commissionAmount || 0);
            const status = curr.adminControls?.initialStatus;
            if (status === 'Processing') acc.processing++;
            else if (status === 'In Review') acc.review++;
            else if (status === 'Completed') acc.completed++;
            return acc;
        }, { totalComm: 0, processing: 0, review: 0, completed: 0 });
    }, [filteredData]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/study-abroad/delete/${id}`);
            fetchData();
        } catch (error: any) { alert(error.response?.data?.message || "Delete failed"); }
    };

    const handleUpdate = async () => {
        try {
            await api.patch(`/study-abroad/update/${selectedApp._id}`, { status: newStatus, commission: Number(newComm) });
            setSelectedApp(null);
            fetchData();
        } catch (error: any) { alert("Update failed"); }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="w-full min-h-screen bg-slate-50 p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black">Application Hub</h1>
                    <p className="text-slate-500 text-sm">Real-time tracking & commission management.</p>
                </div>
                <button onClick={() => router.push('/admin/study-abroad/create')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 flex items-center gap-2">
                    <Plus size={20} /> Create New
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border shadow-sm"><p className="text-[10px] text-slate-400 font-bold uppercase">Total Apps</p><h3 className="text-xl font-black">{filteredData.length}</h3></div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><p className="text-[10px] text-emerald-600 font-bold uppercase">Total Comm.</p><h3 className="text-xl font-black">PKR {stats.totalComm.toLocaleString()}</h3></div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100"><p className="text-[10px] text-blue-500 font-bold uppercase">Processing</p><h3 className="text-xl font-black">{stats.processing}</h3></div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100"><p className="text-[10px] text-amber-500 font-bold uppercase">In Review</p><h3 className="text-xl font-black">{stats.review}</h3></div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100"><p className="text-[10px] text-purple-500 font-bold uppercase">Completed</p><h3 className="text-xl font-black">{stats.completed}</h3></div>
            </div>

            <div className="bg-white p-6 rounded-3xl border mb-6 flex flex-wrap gap-4 items-center">
                <Filter size={20} className="text-slate-400" />
                <input type="text" placeholder="Filter by Agent..." className="bg-slate-50 p-3 rounded-xl border flex-1" onChange={e => setAgentFilter(e.target.value)} />
                <select className="bg-slate-50 p-3 rounded-xl border" onChange={(e) => setDateRangeOption(e.target.value)}>
                    <option value="All">All Time</option>
                    <option value="Day">Today</option>
                    <option value="Week">This Week</option>
                    <option value="Month">This Month</option>
                    <option value="Custom">Custom Date</option>
                </select>
                {dateRangeOption === "Custom" && (
                    <div className="flex gap-2">
                        <input type="date" className="p-2 border rounded-lg" onChange={e => setDateFrom(e.target.value)} />
                        <input type="date" className="p-2 border rounded-lg" onChange={e => setDateTo(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-black">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">University</th>
                            <th className="px-6 py-4">Agent</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredData.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold">{item.studentDetails?.firstName}</td>
                                <td className="px-6 py-4 text-slate-600">{item.courseDetails?.university}</td>
                                <td className="px-6 py-4">{item.agentId?.name || "Admin"}</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold">{item.adminControls?.initialStatus}</span></td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => { setSelectedApp(item); setViewMode('view'); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Eye size={16} /></button>
                                    <button onClick={() => { setSelectedApp(item); setViewMode('edit'); setNewStatus(item.adminControls?.initialStatus); setNewComm(item.adminControls?.commissionAmount); }} className="p-2 bg-slate-100 rounded-lg"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedApp && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">{viewMode === 'edit' ? 'Edit Application' : 'Application Details'}</h2>
                            <button onClick={() => setSelectedApp(null)}><X size={24} /></button>
                        </div>

                        {viewMode === 'edit' ? (
                            <>
                                <select className="w-full p-4 mb-4 bg-slate-50 border rounded-2xl" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                    <option value="Processing">Processing</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <input type="number" className="w-full p-4 mb-4 bg-slate-50 border rounded-2xl" value={newComm} onChange={e => setNewComm(e.target.value)} placeholder="Commission Amount" />
                                <button onClick={handleUpdate} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">SAVE CHANGES</button>
                            </>
                        ) : (
                            <div className="space-y-4 text-sm">
                                <p><strong>Student:</strong> {selectedApp.studentDetails?.firstName} {selectedApp.studentDetails?.lastName}</p>
                                <p><strong>Gender:</strong> {selectedApp.studentDetails?.gender}</p>
                                <p><strong>Email:</strong> {selectedApp.studentDetails?.email}</p>
                                <p><strong>Whatsapp:</strong> {selectedApp.studentDetails?.whatsapp}</p>
                                <p><strong>University:</strong> {selectedApp.courseDetails?.university}</p>
                                <p><strong>Country:</strong> {selectedApp.courseDetails?.universityCountry}</p>
                                <p><strong>previousVisaRefusal:</strong> {selectedApp.studentDetails?.previousVisaRefusal}</p>
                                <p><strong>Course Name:</strong> {selectedApp.courseDetails?.courseName}</p>
                                <p><strong>Course Type:</strong> {selectedApp.courseDetails?.courseType}</p>
                                <p><strong>Status:</strong> {selectedApp.adminControls?.initialStatus}</p>
                                <p><strong>Commission:</strong> PKR {selectedApp.adminControls?.commissionAmount}</p>
                                <p><strong>Agent:</strong> {selectedApp.agentId?.name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}