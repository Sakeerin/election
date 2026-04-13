'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        const token = localStorage.getItem('admin_token');

        if (!storedUser || !token) {
            router.push('/admin');
            return;
        }

        setUser(JSON.parse(storedUser));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin');
    };

    const menuItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'พรรคการเมือง', href: '/admin/parties', icon: '🏛️' },
        { name: 'ผู้สมัคร', href: '/admin/candidates', icon: '👤' },
        { name: 'เขตเลือกตั้ง', href: '/admin/constituencies', icon: '📍' },
        { name: 'บันทึกผลคะแนน', href: '/admin/votes', icon: '🗳️' },
        { name: 'จัดการประชามติ', href: '/admin/referendums', icon: '📝' },
        { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: '⚙️' },
    ];

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col p-6">
                    <div className="mb-10 text-center">
                        <h1 className="text-2xl font-black text-white">Election CMS</h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Management Console</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                                        isActive 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                                👤
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white truncate w-32">{user.displayName || user.username}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <span>🚪</span> ออกจากระบบ
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                <div className="mb-8 flex items-center justify-between lg:hidden">
                    <h1 className="text-xl font-bold text-white">Election CMS</h1>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="rounded-lg bg-slate-800 p-2"
                    >
                        {isSidebarOpen ? '✕' : '☰'}
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}
