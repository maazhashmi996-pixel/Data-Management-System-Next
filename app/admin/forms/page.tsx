"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, User, Mail, Calendar, ExternalLink } from 'lucide-react';

export default function AllFormsPage() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/forms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(res.data);
        } catch (err) {
            console.error("Error fetching forms");
        } finally {
            setLoading(false);
        }
    };

    const deleteForm = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student record?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/delete-form/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(forms.filter((f: any) => f._id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const filteredForms = forms.filter((f: any) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-black">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Student Submissions</h1>
                        <p className="text-slate-500 font-medium">Manage and review all agent-submitted forms</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">Student Details</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">Agent</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">Course / ID</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Loading records...</td></tr>
                            ) : filteredForms.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400">No records found.</td></tr>
                            ) : filteredForms.map((form: any) => (
                                <tr key={form._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {form.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{form.name}</p>
                                                <p className="text-xs text-slate-500">{form.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            {form.agentId?.name || "Unknown Agent"}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                            {form.course || "N/A"}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-slate-500">
                                        {new Date(form.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => deleteForm(form._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
    );
}