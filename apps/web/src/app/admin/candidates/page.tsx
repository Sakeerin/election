'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { IProvince, IConstituency, ICandidate, IParty } from '@election/shared';

type CandidateRow = ICandidate & { party: IParty };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminCandidatesPage() {
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [constituencies, setConstituencies] = useState<IConstituency[]>([]);
    const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
    const [candidates, setCandidates] = useState<CandidateRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
                setFetchError('ไม่สามารถโหลดรายการจังหวัดได้ กรุณาลองใหม่อีกครั้ง');
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (!selectedProvinceId) return;

        const fetchConstituencies = async () => {
            setFetchError(null);
            try {
                const response = await fetch(
                    `${API_BASE}/api/constituencies?electionId=1&provinceId=${selectedProvinceId}`,
                );
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: IConstituency[] = await response.json();
                setConstituencies(data);
                setSelectedConstituencyId(null);
                setCandidates([]);
            } catch (err) {
                console.error('Error fetching constituencies:', err);
                setFetchError('ไม่สามารถโหลดรายการเขตเลือกตั้งได้');
            }
        };
        fetchConstituencies();
    }, [selectedProvinceId]);

    useEffect(() => {
        if (!selectedConstituencyId) return;

        const fetchCandidates = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await fetch(`${API_BASE}/api/candidates?constituencyId=${selectedConstituencyId}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: CandidateRow[] = await response.json();
                setCandidates(data);
            } catch (err) {
                console.error('Error fetching candidates:', err);
                setFetchError('ไม่สามารถโหลดรายชื่อผู้สมัครได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandidates();
    }, [selectedConstituencyId]);

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white">ผู้สมัคร</h1>
                <p className="text-slate-400">รายชื่อผู้สมัคร ส.ส. แบบแบ่งเขต แยกตามเขตเลือกตั้ง</p>
            </div>

            {fetchError && (
                <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
                    {fetchError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">จังหวัด</label>
                    <select
                        className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                        onChange={(e) => setSelectedProvinceId(Number(e.target.value))}
                        value={selectedProvinceId ?? ''}
                    >
                        <option value="">เลือกจังหวัด</option>
                        {provinces.map((p) => (
                            <option key={p.id} value={p.id}>{p.nameTh}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">เขตเลือกตั้ง</label>
                    <select
                        className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                        disabled={!selectedProvinceId}
                        onChange={(e) => setSelectedConstituencyId(Number(e.target.value))}
                        value={selectedConstituencyId ?? ''}
                    >
                        <option value="">เลือกเขต</option>
                        {constituencies.map((c) => (
                            <option key={c.id} value={c.id}>เขต {c.constituencyNumber}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedConstituencyId && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">หมายเลข</th>
                                <th className="px-6 py-4">ชื่อผู้สมัคร</th>
                                <th className="px-6 py-4">พรรค</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-500">ยังไม่มีผู้สมัครในเขตนี้</td>
                                </tr>
                            ) : (
                                candidates.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 text-xl font-black text-slate-600">{c.candidateNumber}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-200">{c.nameTh}</p>
                                            <p className="text-xs text-slate-500">{c.nameEn || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.party.color }} />
                                                <span className="text-sm text-slate-300">{c.party.nameTh}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/candidate/${c.id}`}
                                                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
                                            >
                                                ดูโปรไฟล์
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
