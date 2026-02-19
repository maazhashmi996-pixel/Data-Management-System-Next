"use client";
import Sidebar from '@/Components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Woh pages jahan humein Sidebar NAHI dikhana
    const hideSidebarOn = ['/login', '/admin/setup-root'];

    // Check karein ke current path inme se toh nahi
    const shouldShowSidebar = !hideSidebarOn.includes(pathname);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar sirf tab dikhega jab zaroorat ho */}
            {shouldShowSidebar && <Sidebar />}

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}