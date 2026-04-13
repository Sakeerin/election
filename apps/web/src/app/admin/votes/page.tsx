'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IProvince, IConstituency } from '@election/shared';

export default function AdminVotesPage() {
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [constituencies, setConstituencies] = useState<any[]>([]);
    const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/provinces`);
                const data = await response.json();
                setProvinces(data);
            } catch (err) {
                console.error('Error fetching provinces:', err);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (!selectedProvinceId) return;

        const fetchConstituencies = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/constituencies?provinceId=${selectedProvinceId}`);
                const data = await response.json();
                setConstituencies(data);
                setSelectedConstituencyId(null);
                setResults([]);
            } catch (err) {
                console.error('Error fetching constituencies:', err);
            }
        };
        fetchConstituencies();
    }, [selectedProvinceId]);

    useEffect(() => {
        if (!selectedConstituencyId) return;

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/votes?constituencyId=${selectedConstituencyId}`);
                const data = await response.json();
                setResults(data);
            } catch (err) {
                console.error('Error fetching results:', err);
            } finally {
                setIsLoading(true);
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [selectedConstituencyId]);

    const handleVoteChange = (candidateId: number, value: string) => {
        const count = parseInt(value) || 0;
        setResults(prev => prev.map(r => 
            r.candidateId === candidateId ? { ...r, voteCount: count } : r
        ));
    };

    const handleSave = async () => {
        if (!selectedConstituencyId) return;
        setIsSaving(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/votes/bulk`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    constituencyId: selectedConstituencyId,
                    results: results.map(r => ({
                        candidateId: r.candidateId,
                        voteCount: r.voteCount
                    }))
                }),
            });

            if (!response.ok) throw new Error('Failed to save votes');
            alert('บันทึกคะแนนเรียบร้อยแล้ว และระบบกำลังกระจายข้อมูลแบบ Real-time');
        } catch (err) {
            console.error('Error saving votes:', err);
            alert('เกิดข้อผิดพลาดในการบันทึกคะแนน');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white">บันทึกผลคะแนน</h1>
                <p className="text-slate-400">เลือกเขตเลือกตั้งเพื่อกรอกคะแนนดิบรายผู้สมัคร</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">จังหวัด</label>
                    <select 
                        className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                        onChange={(e) => setSelectedProvinceId(Number(e.target.value))}
                        value={selectedProvinceId || ''}
                    >
                        <option value="">เลือกจังหวัด</option>
                        {provinces.map(p => (
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
                        value={selectedConstituencyId || ''}
                    >
                        <option value="">เลือกเขต</option>
                        {constituencies.map(c => (
                            <option key={c.id} value={c.id}>เขต {c.constituencyNumber}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedConstituencyId && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white">คะแนนรายผู้สมัคร</h3>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกและ Broadcast'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {results.map((result) => (
                            <div key={result.candidateId} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                                <div className="flex-1 flex items-center gap-4">
                                    <span className="text-xl font-black text-slate-700 w-8">{result.candidate.candidateNumber}</span>
                                    <div>
                                        <p className="font-bold text-slate-200">{result.candidate.nameTh}</p>
                                        <p className="text-xs text-slate-500">{result.party.nameTh}</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-48">
                                    <input
                                        type="number"
                                        value={result.voteCount}
                                        onChange={(e) => handleVoteChange(result.candidateId, e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white text-right font-mono text-lg focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
