'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IOverviewSummary } from '@election/shared';

export default function AdminDashboard() {
    const [data, setData] = useState<IOverviewSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/summary/overview?electionId=1`);
                const summary = await response.json();
                setData(summary);
            } catch (err) {
                console.error('Error fetching summary:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex h-full items-center justify-center">
                    <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูลภาพรวม...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white">Dashboard</h1>
                <p className="text-slate-400">สรุปภาพรวมสถานะการรายงานผลการเลือกตั้ง</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">ความคืบหน้าการนับคะแนน</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-blue-500">{data?.countingPercentage || 0}%</p>
                    </div>
                </div>
                
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">พรรคที่นำ (สส. เขต)</p>
                    <p className="text-4xl font-black text-green-500">{data?.parties?.[0]?.party.nameTh || '-'}</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">คะแนนรวมทั้งหมด</p>
                    <p className="text-4xl font-black text-white">{data?.totalCounted?.toLocaleString('th-TH') || 0}</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">สถานะระบบ</p>
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm font-bold text-green-500 border border-green-500/20">
                        ● LIVE / ACTIVE
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                    <h3 className="text-lg font-bold text-white mb-6">สรุปที่นั่งพรรคการเมือง (Top 10)</h3>
                    <div className="space-y-4">
                        {data?.parties?.slice(0, 10).map((p, index) => (
                            <div key={p.party.id} className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-600 w-4">{index + 1}</span>
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.party.color }} />
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold text-slate-300">{p.party.nameTh}</span>
                                        <span className="font-bold text-white">{p.totalSeats} ที่นั่ง</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{ 
                                                width: `${(p.totalSeats / 500) * 100}%`,
                                                backgroundColor: p.party.color 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                    <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/votes" className="rounded-2xl border border-slate-700 bg-slate-950 p-6 hover:bg-slate-800 transition-all text-center group">
                            <span className="text-3xl block mb-3">🗳️</span>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-blue-400">บันทึกคะแนน</p>
                        </Link>
                        <Link href="/admin/parties" className="rounded-2xl border border-slate-700 bg-slate-950 p-6 hover:bg-slate-800 transition-all text-center group">
                            <span className="text-3xl block mb-3">🏛️</span>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-blue-400">จัดการพรรค</p>
                        </Link>
                        <Link href="/admin/candidates" className="rounded-2xl border border-slate-700 bg-slate-950 p-6 hover:bg-slate-800 transition-all text-center group">
                            <span className="text-3xl block mb-3">👤</span>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-blue-400">จัดการผู้สมัคร</p>
                        </Link>
                        <Link href="/admin/settings" className="rounded-2xl border border-slate-700 bg-slate-950 p-6 hover:bg-slate-800 transition-all text-center group">
                            <span className="text-3xl block mb-3">⚙️</span>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-blue-400">ตั้งค่าระบบ</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
