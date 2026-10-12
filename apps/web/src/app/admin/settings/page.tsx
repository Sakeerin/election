'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IElectionSection } from '@election/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminSettingsPage() {
    const [sections, setSections] = useState<IElectionSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/sections?electionId=1`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: IElectionSection[] = await response.json();
                setSections(data);
            } catch (err) {
                console.error('Error fetching sections:', err);
                setErrorMessage('ไม่สามารถโหลดรายการ Section ได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSections();
    }, []);

    const toggleSection = async (section: IElectionSection) => {
        setTogglingId(section.id);
        setErrorMessage(null);
        try {
            const response = await fetch(`${API_BASE}/api/sections/${section.id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // Cookie (httpOnly access_token) is sent automatically
                credentials: 'include',
                body: JSON.stringify({ isEnabled: !section.isEnabled }),
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }
            const updated: IElectionSection = await response.json();
            setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        } catch (err) {
            console.error('Error toggling section:', err);
            setErrorMessage('ไม่สามารถเปลี่ยนการแสดงผลได้ (ต้องเป็น Admin ขึ้นไป)');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white">ตั้งค่าระบบ</h1>
                <p className="text-slate-400">เปิด/ปิด Section บนหน้าแรก — หน้าบ้านจะอัปเดตทันทีผ่าน WebSocket</p>
            </div>

            {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            ) : sections.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-800 p-20 text-center text-slate-500">
                    ยังไม่มี Section สำหรับการเลือกตั้งนี้
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-black text-slate-700 w-8">{section.displayOrder}</span>
                                <div>
                                    <p className="font-bold text-slate-200">{section.titleTh}</p>
                                    <p className="text-xs font-mono text-slate-500">{section.sectionKey}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleSection(section)}
                                disabled={togglingId === section.id}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border disabled:opacity-50 ${
                                    section.isEnabled
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {section.isEnabled ? '● กำลังแสดงผล' : '○ ซ่อนจากหน้าบ้าน'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
