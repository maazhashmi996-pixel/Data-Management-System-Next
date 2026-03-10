"use client";
import React, { useState } from 'react';
import { Search, DollarSign, Users, Calendar, Filter } from 'lucide-react';

export default function AdminStudyAbroadDashboard() {
    const [filterAgent, setFilterAgent] = useState("");
    const [dateFilter, setDateFilter] = useState("month"); // day, week, month, custom

    // Sample Data (Ye backend se aayega)
    const stats = {
        totalStudents: 125,
        totalCommission: "450,000",
        pendingVisas: 14
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Study Abroad Management</h1>

            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Users size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.totalStudents}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-green-100 p-3 rounded-2xl text-green-600"><DollarSign size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Commission</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">PKR {stats.totalCommission}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Calendar size={24} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Visas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.pendingVisas}</p>
                </div>
            </div>

            {/* 2. Filters Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search Agent Name..."
                        className="w-full bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setFilterAgent(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['day', 'week', 'month', 'custom'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setDateFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${dateFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {dateFilter === 'custom' && (
                    <input type="date" className="bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border-none" />
                )}
            </div>

            {/* 3. Student List Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">App ID</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Student Name</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Country</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Agent</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Commission</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {/* Demo Row */}
                        <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm font-bold text-blue-600">SA-2026-8821</td>
                            <td className="p-4">
                                <p className="text-sm font-bold text-slate-900">Ali Khan</p>
                                <p className="text-[10px] text-slate-500 italic">alikk@email.com</p>
                            </td>
                            <td className="p-4 text-sm text-slate-600 font-medium">United Kingdom</td>
                            <td className="p-4 text-sm font-bold text-slate-700">Agent Usman</td>
                            <td className="p-4">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Visa Issued</span>
                            </td>
                            <td className="p-4 text-sm font-black text-slate-900 tracking-tight">PKR 25,000</td>
                            <td className="p-4">
                                <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Edit / Add Comm.</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}