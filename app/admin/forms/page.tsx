"use client";
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
    Search, Plus, X, TrendingUp, Wallet, Users,
    Eye, RefreshCcw, CreditCard,
    UserCheck, Clock, User, MapPin, GraduationCap, Calendar
} from 'lucide-react';

export default function AllFormsPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // --- 🟢 MODAL STATES ---
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // --- FILTERS STATE ---
    const [selectedCSR, setSelectedCSR] = useState("All");

    useEffect(() => { fetchForms(); }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/forms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.forms) setForms(res.data.forms);
            else if (Array.isArray(res.data)) setForms(res.data);
        } catch (err) {
            console.error("Error fetching", err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCSR("All");
    };

    // --- ANALYTICS ---
    const stats = useMemo(() => {
        let revenue = 0;
        let pending = 0;
        forms.forEach(f => {
            const regFee = Number(f.officeUse?.registrationFee) || 0;
            const installments = f.feeHistory?.reduce((sum: number, h: any) => sum + (Number(h.amountPaid) || 0), 0) || 0;
            revenue += (regFee + installments);
            pending += (Number(f.officeUse?.balanceAmount) || 0);
        });
        return { total: forms.length, revenue, pending };
    }, [forms]);

    const filteredForms = forms.filter(f => {
        const searchLower = searchTerm.toLowerCase();
        const agentName = (f.agentName || f.officeUse?.issuedBy || "Admin").toLowerCase();
        const studentName = (f.studentName || "").toLowerCase();

        const matchesSearch = studentName.includes(searchLower) || agentName.includes(searchLower);
        const matchesCSR = selectedCSR === "All" || (f.agentName === selectedCSR || f.officeUse?.issuedBy === selectedCSR);

        return matchesSearch && matchesCSR;
    });

    // --- 🟢 FIXED INSTALLMENT HANDLER ---
    const handleAddInstallment = async (studentId: string) => {
        const amount = prompt("Enter Installment Amount (PKR):");
        if (!amount || isNaN(Number(amount))) return;

        try {
            const token = localStorage.getItem('token');
            // FIX: Removed ':id' and corrected path to match backend: /api/admin/forms/:id/installment
            const res = await axios.post(`http://localhost:5000/api/admin/forms/${studentId}/installment`,
                {
                    amount: Number(amount),      // Backend expects 'amount'
                    amountPaid: Number(amount),  // Keeping for compatibility
                    paymentDate: new Date()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200 || res.status === 201) {
                alert("✅ Installment Added Successfully!");
                setShowModal(false);
                fetchForms(); // Refresh the list and stats
            }
        } catch (err: any) {
            console.error("Payment Error:", err.response?.data || err.message);
            alert(`❌ Payment Failed: ${err.response?.data?.message || "Server Error"}`);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-black font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-blue-600 flex items-center justify-between">
                        <div><p className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Students</p><h3 className="text-4xl font-black">{stats.total}</h3></div>
                        <Users className="text-blue-100" size={50} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-green-500 flex items-center justify-between">
                        <div><p className="text-slate-400 font-black text-xs uppercase tracking-widest">Revenue Collected</p><h3 className="text-3xl font-black text-green-600">Rs. {stats.revenue.toLocaleString()}</h3></div>
                        <TrendingUp className="text-green-100" size={50} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-red-500 flex items-center justify-between">
                        <div><p className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Pending</p><h3 className="text-3xl font-black text-red-600">Rs. {stats.pending.toLocaleString()}</h3></div>
                        <Wallet className="text-red-100" size={50} />
                    </div>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl">
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Education Zone ERP</h1>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Database</div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg mb-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative col-span-1 md:col-span-2">
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Student or Agent Name..."
                                className="w-full pl-10 p-3 bg-slate-100 rounded-xl font-bold outline-none border focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={selectedCSR}
                            className="bg-slate-900 text-white p-3 rounded-xl font-black outline-none"
                            onChange={(e) => setSelectedCSR(e.target.value)}
                        >
                            <option value="All">All CSRs / Agents</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-black flex items-center justify-center gap-1 uppercase hover:bg-red-100"
                        >
                            <RefreshCcw size={14} /> Reset
                        </button>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase">Student / ID</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase">Applied Course</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase">Fee Status</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center font-bold">Loading Data...</td></tr>
                            ) : filteredForms.length > 0 ? (
                                filteredForms.map((form) => (
                                    <tr key={form._id} className="hover:bg-slate-50 transition-all">
                                        <td className="p-8">
                                            <p className="font-black uppercase">{form.studentName}</p>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                                <UserCheck size={12} /> {form.agentName || form.officeUse?.issuedBy || "Admin"}
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="font-bold uppercase text-sm">{form.course}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{form.duration || 'Duration N/A'}</p>
                                        </td>
                                        <td className="p-8">
                                            <p className="font-black text-sm text-red-600">Bal: Rs. {Number(form.officeUse?.balanceAmount).toLocaleString()}</p>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${Math.min(100, ((Number(form.officeUse?.totalFee) - Number(form.officeUse?.balanceAmount)) / (Number(form.officeUse?.totalFee) || 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="p-8 flex justify-center">
                                            <button
                                                onClick={() => { setSelectedStudent(form); setShowModal(true); }}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={18} /> VIEW PROFILE
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="p-10 text-center font-bold text-slate-400">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 🟢 STUDENT PROFILE MODAL --- */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className={`p-8 text-white flex justify-between items-center ${selectedStudent.formType === 'DIB Education System' ? 'bg-indigo-900' : 'bg-orange-600'}`}>
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-2xl">
                                    <User className="text-slate-900" size={30} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-tight">{selectedStudent.studentName}</h2>
                                    <div className="flex gap-4">
                                        <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Type: {selectedStudent.formType}</p>
                                        <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Issued By: {selectedStudent.agentName || "Admin"}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 rounded-full hover:bg-red-500 transition-all"><X size={24} /></button>
                        </div>

                        <div className="p-8 md:p-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* LEFT COLUMN: PERSONAL & ACADEMIC */}
                            <div className="lg:col-span-7 space-y-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]"><User size={14} /> Personal Profile</h4>
                                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem]">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Father's Name</p>
                                            <p className="font-black text-slate-800 uppercase">{selectedStudent.fatherName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">CNIC / B-Form</p>
                                            <p className="font-black text-slate-800">{selectedStudent.cnic}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</p>
                                            <p className="font-black text-slate-800">{selectedStudent.mobileNo}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                                            <p className="font-black text-slate-800 truncate">{selectedStudent.email || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={10} /> Residential Address</p>
                                            <p className="font-bold text-slate-700">{selectedStudent.address || 'Address not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]"><GraduationCap size={14} /> Academic Background</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl">
                                            <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Matric / O-Level</p>
                                            <p className="text-xs font-bold">Board: <span className="text-slate-900 uppercase">{selectedStudent.qualification?.matric?.board || 'N/A'}</span></p>
                                            <p className="text-xs font-bold">Marks: <span className="text-slate-900">{selectedStudent.qualification?.matric?.marks || 'N/A'}</span></p>
                                            <p className="text-xs font-bold">Year: <span className="text-slate-900">{selectedStudent.qualification?.matric?.year || 'N/A'}</span></p>
                                        </div>
                                        <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-3xl">
                                            <p className="text-[10px] font-black text-purple-600 uppercase mb-2">Inter / A-Level</p>
                                            <p className="text-xs font-bold">Board: <span className="text-slate-900 uppercase">{selectedStudent.qualification?.inter?.board || 'N/A'}</span></p>
                                            <p className="text-xs font-bold">Marks: <span className="text-slate-900">{selectedStudent.qualification?.inter?.marks || 'N/A'}</span></p>
                                            <p className="text-xs font-bold">Year: <span className="text-slate-900">{selectedStudent.qualification?.inter?.year || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                    <Calendar className="absolute -right-4 -bottom-4 text-white/5" size={120} />
                                    <div className="grid grid-cols-2 gap-8 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Course</p>
                                            <h3 className="text-xl font-black uppercase text-blue-400">{selectedStudent.course}</h3>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                                            <h3 className="text-xl font-black">{selectedStudent.duration || selectedStudent.officeUse?.duration || 'N/A'}</h3>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Schedule</p>
                                            <h3 className="text-lg font-bold">{selectedStudent.officeUse?.classSchedule || 'Timing not set'}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FINANCIALS */}
                            <div className="lg:col-span-5 space-y-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-[0.2em]"><CreditCard size={14} /> Fee Ledger</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Total Fee</p>
                                        <p className="text-lg font-black text-slate-800">Rs. {Number(selectedStudent.officeUse?.totalFee).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase">Monthly Pay</p>
                                        <p className="text-lg font-black text-indigo-700">Rs. {Number(selectedStudent.officeUse?.monthlyInstallment || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-green-50 p-5 rounded-3xl border border-green-100">
                                        <p className="text-[9px] font-black text-green-600 uppercase">Paid (Initial)</p>
                                        <p className="text-lg font-black text-green-700">Rs. {Number(selectedStudent.officeUse?.registrationFee).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                                        <p className="text-[9px] font-black text-red-600 uppercase">Balance Due</p>
                                        <p className="text-lg font-black text-red-700">Rs. {Number(selectedStudent.officeUse?.balanceAmount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col">
                                    <div className="bg-slate-100 px-6 py-4 flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase">Payment Timeline</span>
                                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                                            {selectedStudent.officeUse?.noOfInstallments || 1} Installments Plan
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-4 max-h-[250px] overflow-y-auto">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border-l-4 border-blue-500">
                                            <div>
                                                <p className="text-xs font-black uppercase text-slate-800">Initial Deposit</p>
                                                <p className="text-[9px] font-bold text-slate-400">Paid at Registration</p>
                                            </div>
                                            <p className="font-black text-sm">Rs. {selectedStudent.officeUse?.registrationFee}</p>
                                        </div>

                                        {selectedStudent.feeHistory?.map((h: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl border-l-4 border-green-500">
                                                <div>
                                                    <p className="text-xs font-black uppercase text-slate-800">Installment #{i + 1}</p>
                                                    <p className="text-[9px] font-bold text-slate-400">{new Date(h.datePaid || h.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-black text-sm text-green-600">+ Rs. {h.amountPaid || h.amount}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-slate-50 mt-auto">
                                        {Number(selectedStudent.officeUse?.balanceAmount) > 0 ? (
                                            <button onClick={() => handleAddInstallment(selectedStudent._id)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                                                <Plus size={18} /> RECORD INSTALLMENT
                                            </button>
                                        ) : (
                                            <div className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                                                <UserCheck size={18} /> FULLY PAID
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}