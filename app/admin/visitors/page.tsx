"use client";
import { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Calendar,
    Phone,
    Briefcase,
    UserCheck,
    Trash2,
    Plus,
    Save,
    X,
    UserCircle
} from 'lucide-react';

interface Visitor {
    id: string;
    name: string;
    phone: string;
    purpose: string;
    attendedBy: string;
    date: string;
    time: string;
}

export default function VisitorManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visitors, setVisitors] = useState<Visitor[]>([]);

    // Form State
    const [newVisitor, setNewVisitor] = useState({
        name: '',
        phone: '',
        purpose: '',
        attendedBy: '' // Ab ye field state se handle hogi
    });

    // Load Data & Initial User
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userName = JSON.parse(storedUser).name;
            setNewVisitor(prev => ({ ...prev, attendedBy: userName }));
        }

        const savedVisitors = localStorage.getItem('crm_visitors');
        if (savedVisitors) setVisitors(JSON.parse(savedVisitors));
    }, [isModalOpen]); // Jab modal khule tab current login user ka naam default aaye

    // Save Data to LocalStorage
    const saveToLocal = (data: Visitor[]) => {
        setVisitors(data);
        localStorage.setItem('crm_visitors', JSON.stringify(data));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const entry: Visitor = {
            id: Math.random().toString(36).substr(2, 9),
            ...newVisitor,
            date: new Date().toLocaleDateString('en-GB'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedList = [entry, ...visitors];
        saveToLocal(updatedList);
        setIsModalOpen(false);
        // Reset form
        setNewVisitor({ name: '', phone: '', purpose: '', attendedBy: newVisitor.attendedBy });
    };

    const deleteVisitor = (id: string) => {
        if (confirm("Kiya aap is record ko delete karna chahte hain?")) {
            const filtered = visitors.filter(v => v.id !== id);
            saveToLocal(filtered);
        }
    };

    const filteredVisitors = visitors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
                            <UserPlus size={28} />
                        </div>
                        DAILY VISITOR LOG
                    </h1>
                    <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Office Walk-in Management</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
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
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Visits</p>
                        <p className="text-slate-900 font-black text-lg italic">Database Records</p>
                    </div>
                </div>

                <div className="md:col-span-2 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or contact number..."
                        className="w-full h-full p-6 pl-16 bg-white border-none rounded-[2rem] shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-600 transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Visitor Info</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Purpose</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Check-in Time</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attended By</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                            {filteredVisitors.length > 0 ? filteredVisitors.map((v) => (
                                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase">
                                                {v.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 uppercase font-black tracking-tight">{v.name}</div>
                                                <div className="text-slate-400 text-[10px] flex items-center gap-1 font-bold">
                                                    <Phone size={10} /> {v.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs max-w-[200px] truncate">
                                            {v.purpose}
                                        </div>
                                    </td>
                                    <td className="p-8 text-xs">
                                        <div className="flex items-center gap-2 text-slate-900">
                                            <Calendar size={14} className="text-blue-500" /> {v.date}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 italic">{v.time}</div>
                                    </td>
                                    <td className="p-8">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] border border-blue-100 uppercase font-black flex items-center gap-2 w-fit">
                                            <UserCheck size={12} /> {v.attendedBy}
                                        </span>
                                    </td>
                                    <td className="p-8 text-center">
                                        <button onClick={() => deleteVisitor(v.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center opacity-30 font-black uppercase tracking-widest text-sm">
                                        No visitor logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL SECTION --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black uppercase tracking-tighter text-2xl">Register Visit</h2>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Manual Entry System</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-5">
                            {/* Visitor Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Visitor Name</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input required type="text" className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" placeholder="Full Name"
                                        onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} value={newVisitor.name} />
                                </div>
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input required type="tel" className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" placeholder="03xx-xxxxxxx"
                                        onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} value={newVisitor.phone} />
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Purpose of Visit</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-5 top-5 text-slate-300" size={20} />
                                    <textarea required rows={2} className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 resize-none" placeholder="Reason for visit..."
                                        onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} value={newVisitor.purpose} />
                                </div>
                            </div>

                            {/* Attended By - AB YE EDITABLE HAI */}
                            <div className="space-y-1 pt-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-2">Attended By (Staff Name)</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-5 pl-14 bg-blue-50 border border-blue-100 rounded-2xl font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                                        placeholder="Staff/Agent Name"
                                        onChange={e => setNewVisitor({ ...newVisitor, attendedBy: e.target.value })}
                                        value={newVisitor.attendedBy}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3">
                                <Save size={20} /> Save Visitor Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}