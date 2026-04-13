'use client';

import { useState, useEffect } from 'react';
import { Radio, BarChart3, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatThaiDate } from '@/lib/utils';

interface NavbarProps {
    electionName: string;
    electionDate: string;
    isLive?: boolean;
    countingPercentage?: number;
}

export default function Navbar({
    electionName,
    electionDate,
    isLive = false,
    countingPercentage = 0,
}: NavbarProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navLinks = [
        { href: '/', label: 'ภาพรวม' },
        { href: '/map', label: 'แผนที่' },
        { href: '/party', label: 'พรรคการเมือง' },
        { href: '/coalition', label: 'จัดตั้งรัฐบาล' },
        { href: '/referendum', label: 'ประชามติ' },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
                            <BarChart3 size={18} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-white font-semibold text-sm leading-tight line-clamp-1">
                                {electionName}
                            </p>
                            <p className="text-slate-400 text-xs">
                                {formatThaiDate(electionDate)}
                            </p>
                        </div>
                        <div className="sm:hidden">
                            <p className="text-white font-semibold text-sm">ผลการเลือกตั้ง</p>
                        </div>
                    </div>

                    {/* Center nav links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'text-blue-400 border-b border-blue-400 pb-0.5'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side: Live status + progress */}
                    <div className="flex items-center gap-3">
                        {/* Live badge */}
                        <div className="flex items-center gap-1.5">
                            <Radio
                                size={14}
                                className={isLive ? 'text-red-500 animate-pulse' : 'text-slate-500'}
                            />
                            <span
                                className={`text-xs font-semibold ${
                                    isLive ? 'text-red-400' : 'text-slate-500'
                                }`}
                            >
                                {isLive ? 'LIVE' : 'ล่าช้า'}
                            </span>
                        </div>

                        {/* Counting % */}
                        <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 rounded-full px-3 py-1.5">
                            <div className="relative w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${countingPercentage}%` }}
                                />
                            </div>
                            <span className="text-white text-xs font-semibold">
                                {countingPercentage}%
                            </span>
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-slate-800">
                    <nav className="px-4 py-4 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium py-2 border-b border-slate-800 ${
                                    pathname === link.href
                                        ? 'text-blue-300'
                                        : 'text-slate-300 hover:text-white'
                                }`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
