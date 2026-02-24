"use client";
import { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', secretKey: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Iske liye backend par ek special route chahiye hoga: /api/admin/setup-root
            const res = await axios.post('https://data-management-system-node-production.up.railway.app/api/admin/setup-root', formData);
            alert("✅ Root Admin Created Successfully!");
            router.push('/login');
        } catch (err: any) {
            alert(err.response?.data?.message || "Setup failed. Maybe admin already exists?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center text-white">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-blue-200" />
                    <h1 className="text-2xl font-bold">System Initialization</h1>
                    <p className="text-blue-100 text-sm mt-2">Create the Master Admin Account</p>
                </div>

                <form onSubmit={handleSetup} className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Master Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input required placeholder="Super Admin" className="w-full border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Admin Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input required type="email" placeholder="admin@system.com" className="w-full border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input required type="password" placeholder="••••••••" className="w-full border border-gray-200 pl-10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-red-400 uppercase mb-1 ml-1">Secret Setup Key</label>
                        <input required type="password" placeholder="Enter System Secret" className="w-full border-2 border-dashed border-red-100 p-3 rounded-xl focus:border-red-500 outline-none text-black"
                            onChange={e => setFormData({ ...formData, secretKey: e.target.value })} />
                        <p className="text-[10px] text-gray-400 mt-1 italic">*This key must match the backend environment secret.</p>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? "Creating..." : "Initialize System"}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
}