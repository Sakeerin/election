'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IProvince, IConstituency, ICandidate, IParty, IConstituencyResult } from '@election/shared';

interface VoteResult {
    candidateId: number;
    voteCount: number;
    candidate: { nameTh: string; candidateNumber: number };
    party: { nameTh: string; color: string };
}

/** Shape returned by GET /constituencies/:id */
interface ConstituencyWithCandidates extends IConstituency {
    candidates: (ICandidate & { party: IParty })[];
    results: IConstituencyResult[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminVotesPage() {
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [constituencies, setConstituencies] = useState<IConstituency[]>([]);
    const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);
    const [results, setResults] = useState<VoteResult[]>([]);
    const [countingProgress, setCountingProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // Only provinces that actually have constituencies in this election
                const response = await fetch(`${API_BASE}/api/provinces?electionId=1`, { credentials: 'include' });
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
                    { credentials: 'include' },
                );
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: IConstituency[] = await response.json();
                setConstituencies(data);
                setSelectedConstituencyId(null);
                setResults([]);
            } catch (err) {
                console.error('Error fetching constituencies:', err);
                setFetchError('ไม่สามารถโหลดรายการเขตเลือกตั้งได้');
            }
        };
        fetchConstituencies();
    }, [selectedProvinceId]);

    useEffect(() => {
        if (!selectedConstituencyId) return;

        const fetchResults = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await fetch(
                    `${API_BASE}/api/constituencies/${selectedConstituencyId}`,
                    { credentials: 'include' },
                );
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data: ConstituencyWithCandidates = await response.json();
                // List every candidate — result rows only exist after the first save
                const voteByCandidate = new Map(data.results.map((r) => [r.candidateId, r.voteCount]));
                const mapped: VoteResult[] = data.candidates.map((c) => ({
                    candidateId: c.id,
                    voteCount: voteByCandidate.get(c.id) ?? 0,
                    candidate: { nameTh: c.nameTh, candidateNumber: c.candidateNumber },
                    party: { nameTh: c.party.nameTh, color: c.party.color },
                }));
                setResults(mapped);
                setCountingProgress(data.countingProgress);
            } catch (err) {
                console.error('Error fetching results:', err);
                setFetchError('ไม่สามารถโหลดผลคะแนนได้');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [selectedConstituencyId]);

    const handleVoteChange = (candidateId: number, value: string) => {
        const count = Math.max(0, parseInt(value, 10) || 0);
        setResults((prev) =>
            prev.map((r) => (r.candidateId === candidateId ? { ...r, voteCount: count } : r)),
        );
    };

    const handleProgressChange = (value: string) => {
        const pct = Math.min(100, Math.max(0, parseFloat(value) || 0));
        setCountingProgress(pct);
    };

    const handleSave = async () => {
        if (!selectedConstituencyId) return;
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const response = await fetch(`${API_BASE}/api/votes/constituency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Cookie (httpOnly access_token) is sent automatically
                credentials: 'include',
                body: JSON.stringify({
                    constituencyId: selectedConstituencyId,
                    votes: results.map((r) => ({
                        candidateId: r.candidateId,
                        voteCount: r.voteCount,
                    })),
                    countingProgress,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            setSaveMessage({ type: 'success', text: 'บันทึกคะแนนเรียบร้อยแล้ว และระบบกำลังกระจายข้อมูลแบบ Real-time' });
        } catch (err) {
            console.error('Error saving votes:', err);
            const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกคะแนน';
            setSaveMessage({ type: 'error', text: message });
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
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white">คะแนนรายผู้สมัคร</h3>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกและ Broadcast'}
                        </button>
                    </div>

                    {saveMessage && (
                        <div className={`mb-6 rounded-xl border p-4 text-sm font-semibold ${
                            saveMessage.type === 'success'
                                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                : 'border-red-500/50 bg-red-500/10 text-red-400'
                        }`}>
                            {saveMessage.text}
                        </div>
                    )}

                    <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                        <div className="flex-1">
                            <p className="font-bold text-slate-200">ความคืบหน้าการนับคะแนน (%)</p>
                            <p className="text-xs text-slate-500">ใส่ 100 เมื่อนับครบ ระบบจะประกาศผู้ชนะของเขตนี้</p>
                        </div>
                        <div className="w-full md:w-48">
                            <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={countingProgress}
                                onChange={(e) => handleProgressChange(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white text-right font-mono text-lg focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12 text-slate-500">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <div className="space-y-4">
                            {results.map((result) => (
                                <div
                                    key={result.candidateId}
                                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800"
                                >
                                    <div className="flex-1 flex items-center gap-4">
                                        <span className="text-xl font-black text-slate-700 w-8">
                                            {result.candidate.candidateNumber}
                                        </span>
                                        <div>
                                            <p className="font-bold text-slate-200">{result.candidate.nameTh}</p>
                                            <p className="text-xs text-slate-500">{result.party.nameTh}</p>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-48">
                                        <input
                                            type="number"
                                            min={0}
                                            value={result.voteCount}
                                            onChange={(e) => handleVoteChange(result.candidateId, e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white text-right font-mono text-lg focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
