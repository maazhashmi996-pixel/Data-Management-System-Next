"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    School,
    GraduationCap,
    LogOut,
    Clock,
    ChevronRight,
    TrendingUp,
    FileText,
    Printer,
    X,
    Loader2,
    Globe,
    DollarSign,
    Filter
} from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import AdmissionForm from '@/Components/AdmissionForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AgentDashboard() {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [agentName, setAgentName] = useState("Agent");
    const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
    const [recentForms, setRecentForms] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState<'All' | 'EducationZone' | 'DIB' | 'StudyAbroad'>('All');
    const [dateFilter, setDateFilter] = useState<'All' | 'Day' | 'Week' | 'Month'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculated Stats & Filters
    const filteredAndComputed = useMemo(() => {
        const now = new Date();
        const filtered = recentForms.filter((f: any) => {
            const formDate = new Date(f.createdAt || Date.now());
            let matchesDate = true;
            if (dateFilter === 'Day') matchesDate = formDate.toDateString() === now.toDateString();
            if (dateFilter === 'Week') {
                const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
                matchesDate = formDate >= weekAgo;
            }
            if (dateFilter === 'Month') matchesDate = formDate.getMonth() === now.getMonth();

            const type = (f.formType || "").toLowerCase();
            const isStudyAbroad = type.includes('study abroad') || type.includes('study-abroad');
            const isDIB = type.includes('dib');
            const isEduZone = type.includes('education zone') || type.includes('education-zone');

            let matchesType = false;
            if (filterType === 'All') matchesType = true;
            else if (filterType === 'StudyAbroad') matchesType = isStudyAbroad;
            else if (filterType === 'DIB') matchesType = isDIB && !isStudyAbroad;
            else if (filterType === 'EducationZone') matchesType = isEduZone && !isStudyAbroad;

            return matchesDate && matchesType;
        });

        const totalCommission = filtered.reduce((acc, curr) => acc + (curr.adminControls?.commissionAmount || 0), 0);
        const studyAbroadCount = filtered.filter(f => (f.formType || "").toLowerCase().includes('study')).length;
        const localFormsCount = filtered.filter(f => !(f.formType || "").toLowerCase().includes('study')).length;

        return { filtered, totalCommission, studyAbroadCount, localFormsCount };
    }, [recentForms, filterType, dateFilter]);

    const fetchDashboardData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [res, studyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/agent/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/study-abroad/all`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const processedStudy = (studyRes.data.data || []).map((item: any) => ({ ...item, formType: 'Study Abroad' }));
            setRecentForms([...(res.data.recentForms || []), ...processedStudy]);
            setStats(res.data.stats || { total: 0, thisMonth: 0 });
        } catch (err: any) { if (err.response?.status === 401) handleLogout(true); } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setAgentName(JSON.parse(userData).name || "Agent");
            fetchDashboardData();
        } else router.push('/login');
        return () => abortControllerRef.current?.abort();
    }, [fetchDashboardData]);

    const handlePrint = useReactToPrint({ contentRef: componentRef });
    const handleLogout = (auto = false) => {
        if (auto || confirm("System se logout karna chahte hain?")) {
            localStorage.clear();
            router.replace('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">EZ</div>
                    <span className="font-black text-slate-800 tracking-tighter uppercase hidden md:block">Enrollment Portal</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-black text-blue-600 text-sm uppercase">{agentName}</span>
                    <button onClick={() => handleLogout(false)} className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl"><LogOut size={20} /></button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <section className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 uppercase mb-6">Dashboard Summary</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard icon={<FileText size={28} />} label="Total Apps" value={filteredAndComputed.filtered.length} color="orange" />
                        <StatCard icon={<DollarSign size={28} />} label="Commission" value={`PKR ${filteredAndComputed.totalCommission}`} color="emerald" />
                        <StatCard icon={<Globe size={28} />} label="Study Abroad" value={filteredAndComputed.studyAbroadCount} color="blue" />
                        <StatCard icon={<School size={28} />} label="" value={filteredAndComputed.localFormsCount} color="indigo" />
                    </div>
                </section>

                <div className="flex gap-4 mb-6">
                    <select className="bg-white p-3 rounded-xl border font-bold text-sm" onChange={(e: any) => setDateFilter(e.target.value)}>
                        <option value="All">All Time</option>
                        <option value="Day">Today</option>
                        <option value="Week">This Week</option>
                        <option value="Month">This Month</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <EntryButton onClick={() => router.push(`/agent/new-form?type=Education Zone`)} icon={<School size={36} />} title="Education Zone" subtitle="Secondary & Higher" borderColor="border-orange-500" iconBg="bg-orange-50" iconColor="text-orange-500" />
                        <EntryButton onClick={() => router.push(`/agent/new-form?type=DIB Education System`)} icon={<GraduationCap size={36} />} title="DIB Education" subtitle="Technical & Professional" borderColor="border-indigo-700" iconBg="bg-indigo-50" iconColor="text-indigo-700" />
                        <EntryButton onClick={() => router.push(`/agent/study-abroad`)} icon={<Globe size={36} />} title="Study Abroad" subtitle="International Admissions" borderColor="border-emerald-600" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="font-black text-slate-800 text-xl uppercase">Recent Activity</h2>
                                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                                    {(['All', 'EducationZone', 'DIB', 'StudyAbroad'] as const).map((t) => (
                                        <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${filterType === t ? 'bg-white shadow-sm' : 'text-slate-400'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 space-y-3 flex-1">
                                {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={40} /></div> :
                                    filteredAndComputed.filtered.map((form: any) => (
                                        <div key={form._id} onClick={() => { setSelectedStudent(form); setIsModalOpen(true); }} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl cursor-pointer hover:bg-slate-100 transition-all">
                                            <div>
                                                <p className="font-black text-lg uppercase">{form.studentName || form.studentDetails?.firstName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{form.formType}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-200 w-full max-w-5xl h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-lg">
                            <h2 className="text-xl font-black uppercase">Preview Application</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-2xl"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8"><AdmissionForm ref={componentRef} data={selectedStudent} type={selectedStudent.formType} /></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colors: any = { orange: "bg-orange-50 text-orange-600", emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", indigo: "bg-indigo-50 text-indigo-600" };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p><p className="text-2xl font-black text-slate-900">{value}</p></div>
        </div>
    );
}

function EntryButton({ onClick, icon, title, subtitle, borderColor, iconBg, iconColor }: any) {
    return (
        <div onClick={onClick} className={`cursor-pointer bg-white p-6 rounded-[2rem] border-l-[8px] ${borderColor} shadow-sm hover:shadow-xl transition-all active:scale-95`}>
            <div className="flex items-center gap-5">
                <div className={`w-16 h-16 ${iconBg} ${iconColor} rounded-3xl flex items-center justify-center shadow-sm`}>{icon}</div>
                <div className="flex-1">
                    <h3 className="font-black text-xl text-slate-800 uppercase">{title}</h3>
                    <p className="text-xs text-slate-500 italic">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}