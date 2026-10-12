'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { IProvince, IConstituency } from '@election/shared';

/** Shape returned by GET /constituencies */
interface ConstituencyRow extends IConstituency {
    province: IProvince;
    _count: { candidates: number };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
    PENDING: { text: 'รอนับคะแนน', className: 'bg-slate-800 text-slate-400 border-slate-700' },
    COUNTING: { text: 'กำลังนับ', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    COMPLETED: { text: 'นับเสร็จแล้ว', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export default function AdminConstituenciesPage() {
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [constituencies, setConstituencies] = useState<ConstituencyRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/provinces?electionId=1`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: IProvince[] = await response.json();
                setProvinces(data);
            } catch (err) {
                console.error('Error fetching provinces:', err);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        const fetchConstituencies = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const query = selectedProvinceId ? `&provinceId=${selectedProvinceId}` : '';
                const response = await fetch(`${API_BASE}/api/constituencies?electionId=1${query}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: ConstituencyRow[] = await response.json();
                setConstituencies(data);
            } catch (err) {
                console.error('Error fetching constituencies:', err);
                setFetchError('ไม่สามารถโหลดรายการเขตเลือกตั้งได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchConstituencies();
    }, [selectedProvinceId]);

    return (
        <AdminLayout>
            <div className="mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">เขตเลือกตั้ง</h1>
                    <p className="text-slate-400">สถานะการนับคะแนนและจำนวนผู้มีสิทธิ์รายเขต</p>
                </div>
                <select
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                    onChange={(e) => setSelectedProvinceId(e.target.value ? Number(e.target.value) : null)}
                    value={selectedProvinceId ?? ''}
                >
                    <option value="">ทุกจังหวัด</option>
                    {provinces.map((p) => (
                        <option key={p.id} value={p.id}>{p.nameTh}</option>
                    ))}
                </select>
            </div>

            {fetchError && (
                <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                    {fetchError}
                </div>
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">จังหวัด / เขต</th>
                            <th className="px-6 py-4">สถานะ</th>
                            <th className="px-6 py-4">ความคืบหน้า</th>
                            <th className="px-6 py-4 text-right">ผู้มีสิทธิ์</th>
                            <th className="px-6 py-4 text-right">ผู้มาใช้สิทธิ์</th>
                            <th className="px-6 py-4 text-right">ผู้สมัคร</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</td>
                            </tr>
                        ) : constituencies.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-slate-500">ไม่พบเขตเลือกตั้ง</td>
                            </tr>
                        ) : (
                            constituencies.map((c) => {
                                const status = STATUS_LABELS[c.status] ?? STATUS_LABELS.PENDING;
                                return (
                                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-200">{c.province.nameTh}</p>
                                            <p className="text-xs text-slate-500">เขต {c.constituencyNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${status.className}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${c.countingProgress}%` }} />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400">{c.countingProgress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-mono text-slate-400">
                                            {c.eligibleVoters.toLocaleString('th-TH')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-mono text-slate-400">
                                            {c.totalVoters.toLocaleString('th-TH')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-400">{c._count.candidates}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/constituency/${c.id}`}
                                                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
                                            >
                                                ดูหน้าเขต
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
