"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // Aapki axios wali file
import {
    UserPlus, Search, Calendar, Phone, UserCheck,
    Trash2, Plus, Save, X, Edit3, Loader2
} from 'lucide-react';

interface Visitor {
    _id?: string;
    name: string;
    phone: string;
    purpose: string;
    attendedBy: string;
    date?: string;
    time?: string;
}

export default function VisitorManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Visitor>({
        name: '',
        phone: '',
        purpose: '',
        attendedBy: ''
    });

    // --- 1. FETCH DATA (Railway Backend) ---
    const fetchVisitors = async () => {
        setLoading(true);
        try {
            // Note: Agar backend route '/visitor' hai to change kar lein
            const res = await api.get('/visitors');
            if (res.data.success) {
                setVisitors(res.data.data);
            }
        } catch (error: any) {
            console.error("Database load fail:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
        // Set Default AttendedBy from LocalStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userName = JSON.parse(storedUser).name;
            setFormData(prev => ({ ...prev, attendedBy: userName }));
        }
    }, []);

    // --- 2. SAVE OR UPDATE (Railway Backend) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update Existing (PUT)
                const res = await api.put(`/visitors/${editingId}`, formData);
                if (res.data.success) alert("Record Update hogya!");
            } else {
                // Save New (POST)
                const res = await api.post('/visitors', formData);
                if (res.data.success) alert("Database mein save hogya!");
            }
            closeModal();
            fetchVisitors();
        } catch (error: any) {
            alert(error.response?.data?.message || "Action failed!");
        }
    };

    // --- 3. DELETE (Railway Backend) ---
    const deleteVisitor = async (id: string) => {
        if (confirm("Kiya aap is record ko delete karna chahte hain?")) {
            try {
                const res = await api.delete(`/visitors/${id}`);
                if (res.data.success) {
                    fetchVisitors();
                }
            } catch (error: any) {
                alert("Delete nahi ho saka!");
            }
        }
    };

    // --- 4. EDIT PREPARATION ---
    const handleEdit = (visitor: Visitor) => {
        setEditingId(visitor._id || null);
        setFormData({
            name: visitor.name,
            phone: visitor.phone,
            purpose: visitor.purpose,
            attendedBy: visitor.attendedBy
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        // Reset form but keep 'attendedBy' persistent
        const storedUser = localStorage.getItem('user');
        const userName = storedUser ? JSON.parse(storedUser).name : '';
        setFormData({ name: '', phone: '', purpose: '', attendedBy: userName });
    };

    const filteredVisitors = visitors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                            <UserPlus size={28} />
                        </div>
                        VISITOR MANAGEMENT
                    </h1>
                    {loading && (
                        <div className="flex items-center gap-2 text-blue-500 mt-2 font-bold animate-pulse">
                            <Loader2 className="animate-spin" size={16} /> Syncing Database...
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3"
                >
                    <Plus size={20} strokeWidth={3} /> ADD NEW VISITOR
                </button>
            </div>

            {/* --- SEARCH & STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl">
                        {visitors.length}
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Logs</p>
                        <p className="text-slate-900 font-black text-lg italic italic">Railway Cloud DB</p>
                    </div>
                </div>

                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or contact number..."
                        className="w-full h-full p-6 pl-16 bg-white rounded-[2rem] shadow-sm outline-none font-bold text-slate-700 focus:ring-2 ring-blue-500/20"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                                <th className="p-8">Visitor Details</th>
                                <th className="p-8">Purpose</th>
                                <th className="p-8">Check-in Info</th>
                                <th className="p-8">Handled By</th>
                                <th className="p-8 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-sm">
                            {filteredVisitors.map((v) => (
                                <tr key={v._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all uppercase font-black text-slate-600">
                                                {v.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 uppercase font-black tracking-tight">{v.name}</div>
                                                <div className="text-slate-400 text-[10px] flex items-center gap-1">
                                                    <Phone size={10} /> {v.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs max-w-[200px] truncate italic text-slate-600">
                                            "{v.purpose}"
                                        </div>
                                    </td>
                                    <td className="p-8 text-xs">
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <Calendar size={14} className="text-blue-500" /> {v.date || 'Today'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 italic">{v.time || 'Check-in'}</div>
                                    </td>
                                    <td className="p-8">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] border border-blue-100 uppercase font-black flex items-center gap-2 w-fit">
                                            <UserCheck size={12} /> {v.attendedBy}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(v)} className="p-2 text-slate-400 hover:text-blue-600 transition-all hover:bg-blue-50 rounded-lg">
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => deleteVisitor(v._id!)} className="p-2 text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg">
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

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <h2 className="font-black uppercase text-2xl tracking-tighter">
                                {editingId ? 'Update Visit' : 'Register Visit'}
                            </h2>
                            <button onClick={closeModal} className="bg-white/10 hover:bg-red-500 transition-colors p-2 rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Visitor Name</label>
                                <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                                    placeholder="Enter full name"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} value={formData.name} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Phone Number</label>
                                <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                                    placeholder="e.g 0300 1234567"
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })} value={formData.phone} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Purpose</label>
                                <textarea required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold resize-none h-24 focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-all"
                                    placeholder="Why are they visiting?"
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })} value={formData.purpose} />
                            </div>

                            <div className="pt-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase ml-2">Attended By</label>
                                <input required className="w-full p-5 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-700 uppercase outline-none"
                                    onChange={e => setFormData({ ...formData, attendedBy: e.target.value })} value={formData.attendedBy} />
                            </div>

                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20">
                                <Save size={20} /> {editingId ? 'Update Record' : 'Save to Cloud'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}