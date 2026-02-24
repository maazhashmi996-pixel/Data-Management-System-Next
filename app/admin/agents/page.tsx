"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios'; // ✅ Centralized axios instance use kiya hai
import { toast } from 'react-hot-toast'; // ✅ Professional notifications
import { UserPlus, Trash2, ShieldCheck, Mail, Lock, User, Loader2 } from 'lucide-react';

interface Agent {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function AgentManagement() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    // ✅ Memoized fetch function taake unnecessary re-renders na hon
    const fetchAgents = useCallback(async () => {
        setFetching(true);
        try {
            const res = await api.get('/admin/agents');
            // Backend data handling
            const agentsData = res.data.agents || res.data;
            setAgents(Array.isArray(agentsData) ? agentsData : []);
        } catch (err: any) {
            console.error("Agents fetch error:", err);
            toast.error("Agents list load nahi ho saki");
            setAgents([]);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.password.length < 6) {
            toast.error("Password kam az kam 6 characters ka hona chahiye");
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/create-agent', formData);
            toast.success("✅ Agent Created Successfully!");
            setFormData({ name: '', email: '', password: '' });
            fetchAgents();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Error creating agent";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const deleteAgent = async (id: string) => {
        if (window.confirm("Are you sure? Is agent ka sara data (forms) admin ke control mein rahega par agent login nahi kar payega.")) {
            try {
                await api.delete(`/admin/delete-agent/${id}`);
                toast.success("Agent removed successfully");
                fetchAgents();
            } catch (err) {
                toast.error("Delete failed!");
            }
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-black">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-800">
                    <ShieldCheck className="text-blue-600 w-8 h-8" />
                    Agent Control Center
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Agent Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <UserPlus size={20} className="text-blue-500" /> Add New Member
                        </h2>

                        <form onSubmit={handleCreateAgent} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        placeholder="John Doe"
                                        className="w-full border border-gray-200 pl-10 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        value={formData.name}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="agent@zone.com"
                                        className="w-full border border-gray-200 pl-10 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        value={formData.email}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full border border-gray-200 pl-10 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        value={formData.password}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Authorize Agent"}
                            </button>
                        </form>
                    </div>

                    {/* Agents List Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-700">Active Agents ({agents.length})</h2>
                            {fetching && <Loader2 className="animate-spin text-blue-500 w-4 h-4" />}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="p-4">Agent Info</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Joined Date</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {agents.map(agent => (
                                        <tr key={agent._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                                        {agent.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{agent.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{agent.email}</td>
                                            <td className="p-4 text-gray-400 text-xs">
                                                {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => deleteAgent(agent._id)}
                                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!fetching && agents.length === 0 && (
                                <div className="p-10 text-center text-gray-400 italic">
                                    No agents found. Start by adding one!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}