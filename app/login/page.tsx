"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            // Storing token and user data
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Role based navigation
            if (res.data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/agent/dashboard');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Login Failed! Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
                    <div className="p-8">
                        {/* Header Area */}
                        <div className="text-center mb-8">
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                                <ShieldCheck className="text-white w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">CRM Login</h2>
                            <p className="text-gray-400 text-sm mt-1 font-medium">Please enter your details to sign in</p>
                        </div>

                        {/* Form Area */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@example.com"
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-100 group disabled:opacity-70"
                            >
                                {loading ? "Authenticating..." : "Sign In"}
                                {!loading && <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        {/* Setup Section */}
                        <div className="mt-10 pt-6 border-t border-gray-50 text-center">
                            <p className="text-gray-400 text-[11px] mb-3 uppercase tracking-tighter">System Administrator Only</p>
                            <Link
                                href="/admin/setup-root"
                                className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors"
                            >
                                First Time Setup? Create Account
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
                <p className="text-center text-gray-400 text-[10px] mt-8 uppercase tracking-[0.2em]">
                    &copy; 2026 CRM Systems - Secure Access
                </p>
            </div>
        </div>
    );
}