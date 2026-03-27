"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    School,
    GraduationCap,
    LogOut,
    FileText,
    Printer,
    X,
    Loader2,
    Globe,
    DollarSign,
    Eye
} from 'lucide-react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import AdmissionForm from '@/Components/AdmissionForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AgentDashboard() {
    const router = useRouter();
    const componentRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Production States
    const [agentName, setAgentName] = useState("Agent");
    const [isMounted, setIsMounted] = useState(false); // New: To fix hydration
    const [recentForms, setRecentForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState<'All' | 'EducationZone' | 'DIB' | 'StudyAbroad'>('All');
    const [dateFilter, setDateFilter] = useState<'All' | 'Day' | 'Week' | 'Month'>('All');

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = useCallback((auto = false) => {
        if (typeof window !== 'undefined') {
            if (auto || confirm("System se logout karna chahte hain?")) {
                localStorage.clear();
                router.replace('/login');
            }
        }
    }, [router]);

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
        } catch (err: any) {
            if (err.response?.status === 401) handleLogout(true);
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        setIsMounted(true); // Mark as mounted for production safety
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setAgentName(JSON.parse(userData).name || "Agent");
                fetchDashboardData();
            } catch (e) {
                console.error("User data parse error");
            }
        } else {
            router.push('/login');
        }
        return () => abortControllerRef.current?.abort();
    }, [fetchDashboardData, router]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Admission-Form-${selectedStudent?.studentName || 'Student'}`,
    });

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">EZ</div>
                    <span className="font-black text-slate-800 tracking-tighter uppercase hidden md:block">Enrollment Portal</span>
                </div>
                {/* Agent Name and Logout UI Section - Fixed for Production */}
                <div className="flex items-center gap-4">
                    <span className="font-black text-blue-600 text-sm uppercase">{agentName}</span>
                    <button
                        onClick={() => handleLogout(false)}
                        className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <section className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 uppercase mb-6">Dashboard Summary</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard icon={<FileText size={28} />} label="Total Apps" value={filteredAndComputed.filtered.length} color="orange" />
                        <StatCard icon={<DollarSign size={28} />} label="Commission" value={`PKR ${filteredAndComputed.totalCommission}`} color="emerald" />
                        <StatCard icon={<Globe size={28} />} label="Study Abroad" value={filteredAndComputed.studyAbroadCount} color="blue" />
                        <StatCard icon={<School size={28} />} label="GED" value={filteredAndComputed.localFormsCount} color="indigo" />
                    </div>
                </section>

                <div className="flex gap-4 mb-6">
                    <select className="bg-white p-3 rounded-xl border font-bold text-sm outline-none" onChange={(e: any) => setDateFilter(e.target.value)}>
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
                                        <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterType === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 space-y-3 flex-1">
                                {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div> :
                                    filteredAndComputed.filtered.map((form: any) => (
                                        <div key={form._id} onClick={() => { setSelectedStudent(form); setIsModalOpen(true); }} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl cursor-pointer hover:bg-slate-100 transition-all shadow-sm border border-transparent hover:border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${form.formType === 'Study Abroad' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {form.formType === 'Study Abroad' ? <Globe size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg uppercase leading-tight">{form.studentName || form.studentDetails?.firstName || "N/A"}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{form.formType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {form.formType === 'Study Abroad' ? <Eye size={20} className="text-slate-400" /> : <Printer size={20} className="text-slate-400" />}
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
                    <div className="bg-slate-200 w-full max-w-5xl h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-lg border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-black uppercase text-slate-800">Preview Application</h2>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{selectedStudent.formType}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!(selectedStudent.formType || "").toLowerCase().includes('study') && (
                                    <button
                                        onClick={() => setTimeout(() => handlePrint(), 300)}
                                        className="p-3 bg-blue-600 text-white rounded-2xl flex items-center gap-2 font-black text-xs uppercase shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Printer size={18} /> Print Form
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                            {selectedStudent.formType === 'Study Abroad' ? (
                                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-200 max-w-3xl mx-auto w-full relative overflow-hidden">
                                    <Globe className="absolute -right-10 -bottom-10 text-slate-100 w-64 h-64 -z-0 opacity-50" />
                                    <div className="relative z-10">
                                        <div className="border-b-2 border-slate-100 pb-6 mb-8 flex justify-between items-end">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Study Abroad Details</h3>
                                                <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">International Admission File</p>
                                            </div>
                                            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">Verified</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Student Name</label>
                                                <p className="text-xl font-bold text-slate-800 uppercase">
                                                    {selectedStudent.studentName || `${selectedStudent.studentDetails?.firstName || ""} ${selectedStudent.studentDetails?.lastName || ""}`.trim() || "N/A"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Number</label>
                                                <p className="text-xl font-bold text-slate-800 uppercase">
                                                    {selectedStudent.whatsapp || selectedStudent.studentDetails?.whatsapp || "N/A"}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Passport No</label>
                                                <p className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                                                    {selectedStudent.passportNo || selectedStudent.studentDetails?.passportNo || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Desired Country</label>
                                                <p className="text-xl font-bold text-blue-600 underline decoration-2 underline-offset-4">
                                                    {selectedStudent.country || selectedStudent.courseDetails?.universityCountry || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Course Type</label>
                                                <p className="text-xl font-bold text-slate-800">
                                                    {selectedStudent.lastQualification || selectedStudent.courseDetails?.courseType || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-12 pt-8 border-t border-slate-50 flex gap-4">
                                            <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Application ID</span>
                                                <span className="text-xs font-mono font-bold text-slate-500">{selectedStudent._id}</span>
                                            </div>
                                            <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Status</span>
                                                <span className="text-xs font-bold text-emerald-600 uppercase">Received</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center overflow-x-auto min-w-fit">
                                    <div ref={componentRef} className="print-container shadow-2xl bg-white rounded-sm">
                                        <AdmissionForm
                                            data={selectedStudent}
                                            type={selectedStudent.formType?.includes('DIB') ? 'DIB Education System' : 'Education Zone'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    const colors: any = {
        orange: "bg-orange-50 text-orange-600",
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600"
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
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