import Link from 'next/link';
import { MapConstituency } from '@/lib/mapData';

interface ConstituencyDetailProps {
    constituency: MapConstituency | null;
}

export default function ConstituencyDetail({ constituency }: ConstituencyDetailProps) {
    if (!constituency) {
        return (
            <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
                <h3 className="text-sm font-semibold text-white">Constituency Detail</h3>
                <p className="mt-2 text-xs text-slate-400">เลือกจังหวัดหรือเขตในแผนที่เพื่อดูรายละเอียด</p>
            </section>
        );
    }

    const leader = constituency.results[0];
    const second = constituency.results[1];

    return (
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-white">{constituency.provinceName} เขต {constituency.constituencyNumber}</h3>
                    <p className="text-xs text-slate-400">นับแล้ว {constituency.countingProgress.toFixed(1)}% | ผู้มาใช้สิทธิ {constituency.turnoutPct.toFixed(1)}%</p>
                </div>
                <Link
                    href={`/constituency/${constituency.id}`}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-xs text-blue-200 hover:bg-blue-500/25"
                >
                    ดูรายละเอียดเต็ม
                </Link>
            </div>

            <div className="space-y-2">
                {constituency.results.map((result) => (
                    <div key={result.candidateId}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-slate-100">{result.candidateName}</span>
                            <span className="text-slate-300">{result.voteCount.toLocaleString('th-TH')} ({result.votePct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                            <div
                                className="h-2 rounded-full"
                                style={{
                                    width: `${Math.min(100, result.votePct)}%`,
                                    backgroundColor: result.partyColor,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {leader && second && (
                <p className="mt-3 text-xs text-amber-300">
                    คะแนนห่าง {Math.max(0, leader.votePct - second.votePct).toFixed(2)}%
                </p>
            )}
        </section>
    );
}
