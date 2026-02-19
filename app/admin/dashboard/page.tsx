"use client";
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Users,
    FileText,
    Printer,
    Trash2,
    Search,
    PlusCircle,
    LayoutDashboard,
    X,
    Eye
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRouter } from 'next/navigation';
import AdmissionForm from '../../../Components/AdmissionForm';

// Interfaces
interface Form {
    _id: string;
    studentName: string;
    formType: 'Education Zone' | 'DIB Education System';
    agentId: { name: string };
    createdAt: string;
    regNo?: string;
    course?: string;
    [key: string]: any;
}

interface Stats {
    totalForms: number;
    totalAgents: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [filteredForms, setFilteredForms] = useState<Form[]>([]);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    // Print Logic
    const handlePrint = useReactToPrint({
        // @ts-ignore
        contentRef: printRef,
        documentTitle: `Admission_Form_${selectedForm?.studentName || 'Student'}`,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [resStats, resForms] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', { headers }),
                axios.get('http://localhost:5000/api/admin/forms', { headers })
            ]);

            setStats(resStats.data);
            setForms(resForms.data);
            setFilteredForms(resForms.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const results = forms.filter(form =>
            form.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.agentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredForms(results);
    }, [searchTerm, forms]);

    const deleteForm = async (id: string) => {
        if (confirm("Kiya aap waqai is student record ko delete karna chahte hain? Ye wapas nahi ayega.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/admin/delete-form/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
            } catch (error) {
                alert("Delete failed!");
            }
        }
    };

    const openPreview = (form: Form) => {
        setSelectedForm(form);
        setIsPreviewOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-black">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard className="text-blue-600" size={24} />
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Admin Panel</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm italic">Managing all agents and student enrollments.</p>
                </div>

                <button
                    onClick={() => router.push('/agent/create-form?type=Education Zone')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black shadow-lg transition-all active:scale-95"
                >
                    <PlusCircle size={20} /> NEW ENROLLMENT
                </button>
            </div>

            {/* --- 1. SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="p-4 bg-blue-100 rounded-2xl text-blue-600">
                        <FileText size={32} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Forms</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats?.totalForms || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Active Agents</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats?.totalAgents || 0}</h3>
                    </div>
                </div>
            </div>

            {/* --- 2. MANAGEMENT TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="font-black text-lg text-slate-800 uppercase tracking-tight">Student Records</h2>

                    <div className="relative w-full md:w-1/3 group">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, agent or reg no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Student Info</th>
                                <th className="p-6">Form Type</th>
                                <th className="p-6">Agent Name</th>
                                <th className="p-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-300 animate-pulse uppercase">Loading Database...</td></tr>
                            ) : filteredForms.map((form) => (
                                <tr key={form._id} className="hover:bg-slate-50 transition-all group">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-800">{form.studentName}</p>
                                        <p className="text-[10px] text-blue-600 font-black uppercase">{form.regNo || `ID: ${form._id.slice(-6)}`}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${form.formType.includes('Zone')
                                                ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            }`}>
                                            {form.formType}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold">
                                                {form.agentId?.name?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">{form.agentId?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openPreview(form)}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                title="View & Print"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteForm(form._id)}
                                                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 3. VIEW & PRINT MODAL --- */}
            {isPreviewOpen && selectedForm && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-100 w-full max-w-5xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-white p-6 flex justify-between items-center border-b">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase">Document Preview</h2>
                                <p className="text-xs text-slate-500 font-bold">Student: {selectedForm.studentName}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handlePrint()}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    <Printer size={18} /> Print Document
                                </button>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body (Admission Form Component) */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-200/50">
                            <div className="max-w-[800px] mx-auto bg-white shadow-2xl">
                                <AdmissionForm
                                    ref={printRef}
                                    data={selectedForm}
                                    type={selectedForm.formType}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}