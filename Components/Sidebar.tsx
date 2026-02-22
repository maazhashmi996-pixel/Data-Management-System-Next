"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    LogOut,
    ShieldCheck,
    UserCircle,
    PlusCircle,
    ClipboardList,
    GraduationCap,
    BookOpenCheck // Naya icon Exam Booking ke liye
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string, role: string } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // --- ADMIN MENU CONFIGURATION ---
    const adminMenu = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Manage Agents', path: '/admin/agents', icon: <Users size={20} /> },
        { name: 'Faculty Directory', path: '/admin/teacher', icon: <GraduationCap size={20} /> },
        { name: 'All Student Forms', path: '/admin/forms', icon: <FileText size={20} /> },
        { name: 'Exam Management', path: '/admin/exams', icon: <BookOpenCheck size={20} /> }, // Admin ke liye Management field
    ];

    // --- AGENT MENU CONFIGURATION ---
    const agentMenu = [
        { name: 'My Dashboard', path: '/agent/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'New Admission', path: '/agent/new-form', icon: <PlusCircle size={20} /> },
        { name: 'Exam Booking', path: '/agent/exam-booking', icon: <BookOpenCheck size={20} /> }, // Agent ke liye Booking field
        { name: 'My Submissions', path: '/agent/my-forms', icon: <ClipboardList size={20} /> },
    ];

    // Determine which menu to show
    const menuItems = user?.role === 'admin' ? adminMenu : agentMenu;

    const handleLogout = () => {
        if (confirm("Kiya aap waqai logout karna chahte hain?")) {
            localStorage.clear();
            router.push('/login');
        }
    };

    return (
        <div className="w-64 bg-slate-900 h-screen text-white p-5 flex flex-col sticky top-0 border-r border-slate-800 shadow-2xl shrink-0 z-50">

            {/* 1. Brand Logo Area */}
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                    <ShieldCheck size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter text-white leading-none">CRM PANEL</span>
                    <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-1 italic">
                        {user?.role === 'admin' ? 'Administration' : 'Agent Portal'}
                    </span>
                </div>
            </div>

            {/* 2. User Profile Card */}
            <div className="mb-8 px-1">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-blue-400 border border-slate-600 shrink-0 shadow-inner">
                        <UserCircle size={24} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate text-slate-100">{user?.name || "Loading..."}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-tight mt-0.5">
                            {user?.role || 'User'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Navigation Links */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 opacity-70">
                    Main Menu
                </p>
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 ${pathname === item.path
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className={`${pathname === item.path ? 'text-white scale-110' : 'text-slate-500 group-hover:text-blue-400 group-hover:scale-110'} transition-all duration-300`}>
                            {item.icon}
                        </span>
                        <span className="font-bold text-sm tracking-wide">{item.name}</span>

                        {pathname === item.path && (
                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* 4. Bottom Logout Section */}
            <div className="pt-5 mt-auto border-t border-slate-800/60">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
                >
                    <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Sign Out System</span>
                </button>
                <div className="flex flex-col items-center mt-4 opacity-30">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em]">Build v2.0.4</p>
                    <div className="w-12 h-1 bg-slate-800 rounded-full mt-1"></div>
                </div>
            </div>
        </div>
    );
}