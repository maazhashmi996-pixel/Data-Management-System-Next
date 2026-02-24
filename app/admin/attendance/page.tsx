"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Calendar, Save, Download, UserCheck, Loader2, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Axios Instance for Production
const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://data-management-system-node-production.up.railway.app/api',
});

// Request Interceptor to add Token
API.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function StaffAttendance() {
    // --- States ---
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeFilter, setActiveFilter] = useState('day');
    const [roleFilter, setRoleFilter] = useState('all');

    // --- Logic ---

    const handleQuickFilter = (type: 'day' | 'week' | 'month') => {
        const end = new Date();
        const start = new Date();
        if (type === 'week') start.setDate(end.getDate() - 7);
        else if (type === 'month') start.setMonth(end.getMonth() - 1);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setActiveFilter(type);
    };

    const fetchStaffData = useCallback(async () => {
        try {
            setLoading(true);

            // Parallel Fetching for speed
            const [agentsRes, teachersRes, attendanceRes] = await Promise.all([
                API.get('/admin/agents').catch(() => ({ data: { agents: [] } })),
                API.get('/admin/teachers').catch(() => ({ data: { teachers: [] } })),
                API.get(`/admin/attendance/report?startDate=${startDate}&endDate=${activeFilter === 'day' ? startDate : endDate}`)
            ]);

            const rawAgents = agentsRes.data?.agents || agentsRes.data?.data || [];
            const rawTeachers = teachersRes.data?.teachers || teachersRes.data?.data || [];
            const rawAttendance = attendanceRes.data?.data || attendanceRes.data || [];

            const rawStaffList = [...(Array.isArray(rawAgents) ? rawAgents : []), ...(Array.isArray(rawTeachers) ? rawTeachers : [])];

            const attendanceMap = new Map();
            if (Array.isArray(rawAttendance)) {
                rawAttendance.forEach((rec: any) => {
                    const id = rec.staffId?._id || rec.staffId;
                    attendanceMap.set(id, rec);
                });
            }

            const mergedData = rawStaffList.map((s: any) => {
                const existing = attendanceMap.get(s._id);
                return {
                    ...s,
                    attendanceId: existing?._id || null,
                    role: s.role || 'Staff',
                    status: existing ? existing.status : 'Present',
                    inTime: existing ? existing.inTime : '09:00',
                    outTime: existing ? existing.outTime : '17:00',
                    isMarked: !!existing
                };
            });

            setStaff(mergedData);
        } catch (error: any) {
            console.error("Fetch Error:", error);
            toast.error("Records load karne mein masla hua.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, activeFilter]);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);

    const handleSave = async (staffId: string, status: string, inTime: string, outTime: string) => {
        try {
            setIsSaving(staffId);
            const response = await API.post('/admin/attendance/mark', {
                staffId,
                date: startDate,
                status,
                inTime,
                outTime
            });

            if (response.data.success || response.status === 200) {
                toast.success(`Entry saved for ${startDate}`);
                fetchStaffData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error saving entry");
        } finally {
            setIsSaving(null);
        }
    };

    const handleDelete = async (attendanceId: string, staffId: string) => {
        if (!attendanceId) return toast.error("Pehle entry save karein!");
        if (!confirm("Kya aap is record ko delete karna chahte hain?")) return;

        try {
            setIsDeleting(staffId);
            await API.delete(`/admin/attendance/${attendanceId}`);
            toast.success("Entry deleted!");
            fetchStaffData();
        } catch (error: any) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredStaff = useMemo(() => {
        return staff.filter(s => {
            const matchesRole = roleFilter === 'all' || s.role?.toLowerCase() === roleFilter.toLowerCase();
            const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [staff, roleFilter, searchTerm]);

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <span className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg">
                                <UserCheck size={28} />
                            </span>
                            STAFF ATTENDANCE
                        </h1>
                        <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-widest px-1">Manage Daily Logs & Attendance</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Quick Filter Buttons */}
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto overflow-x-auto">
                            {['day', 'week', 'month'].map((id) => (
                                <button
                                    key={id}
                                    onClick={() => handleQuickFilter(id as any)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeFilter === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {id}
                                </button>
                            ))}
                        </div>

                        {/* Custom Calendar */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex-1 md:flex-none justify-center">
                            <Calendar size={16} className="text-blue-600" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setActiveFilter('custom');
                                }}
                                className="outline-none font-black text-xs text-slate-700 cursor-pointer bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search staff by name..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm font-bold text-sm outline-none focus:ring-2 ring-blue-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm font-bold text-sm outline-none cursor-pointer hover:border-blue-200 transition-all"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="agent">Agents Only</option>
                        <option value="teacher">Teachers Only</option>
                    </select>
                    <button className="bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 py-4">
                        <Download size={18} /> EXPORT
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400">Staff Details</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Attendance Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-center text-slate-400">In Time</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-center text-slate-400">Out Time</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-right text-slate-400">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-blue-600" size={40} />
                                                <span className="font-black text-slate-300 uppercase tracking-widest text-xs">Syncing Live Records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center font-bold text-slate-400 italic">No staff members match your current filters.</td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-200 shadow-sm">
                                                        {item.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm">{item.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => {
                                                        const updated = [...staff];
                                                        const idx = staff.findIndex(s => s._id === item._id);
                                                        updated[idx].status = e.target.value;
                                                        setStaff(updated);
                                                    }}
                                                    className={`font-black text-[10px] p-2.5 rounded-xl outline-none border transition-all cursor-pointer min-w-[110px] ${item.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            item.status === 'Absent' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}
                                                >
                                                    <option value="Present">PRESENT</option>
                                                    <option value="Absent">ABSENT</option>
                                                    <option value="Leave">LEAVE</option>
                                                </select>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="inline-flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200 focus-within:border-blue-400 transition-all">
                                                    <Clock size={12} className="text-slate-400 mr-2" />
                                                    <input
                                                        type="time"
                                                        value={item.inTime}
                                                        onChange={(e) => {
                                                            const updated = [...staff];
                                                            const idx = staff.findIndex(s => s._id === item._id);
                                                            updated[idx].inTime = e.target.value;
                                                            setStaff(updated);
                                                        }}
                                                        className="bg-transparent py-2.5 text-[11px] font-black outline-none text-slate-700"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="inline-flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200 focus-within:border-blue-400 transition-all">
                                                    <Clock size={12} className="text-slate-400 mr-2" />
                                                    <input
                                                        type="time"
                                                        value={item.outTime}
                                                        onChange={(e) => {
                                                            const updated = [...staff];
                                                            const idx = staff.findIndex(s => s._id === item._id);
                                                            updated[idx].outTime = e.target.value;
                                                            setStaff(updated);
                                                        }}
                                                        className="bg-transparent py-2.5 text-[11px] font-black outline-none text-slate-700"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {item.isMarked && (
                                                        <button
                                                            onClick={() => handleDelete(item.attendanceId, item._id)}
                                                            disabled={isDeleting === item._id}
                                                            className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                            title="Delete Record"
                                                        >
                                                            {isDeleting === item._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleSave(item._id, item.status, item.inTime, item.outTime)}
                                                        disabled={isSaving === item._id}
                                                        className={`px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm active:scale-95 ${item.isMarked ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                                                            }`}
                                                    >
                                                        {isSaving === item._id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                        {item.isMarked ? "Update" : "Save"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}