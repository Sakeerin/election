import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { fetchOverviewData } from '@/lib/fetchOverviewData';
import { fetchConstituencyDetail } from '@/lib/fetchConstituencyDetail';

interface ConstituencyDetailPageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 10;

export default async function ConstituencyDetailPage({ params }: ConstituencyDetailPageProps) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    const [overview, data] = await Promise.all([
        fetchOverviewData(),
        fetchConstituencyDetail(id),
    ]);

    if (!data) {
        notFound();
    }

    const topVotes = data.results[0]?.voteCount ?? 1;

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar
                electionName={overview.election.name}
                electionDate={overview.election.electionDate}
                countingPercentage={overview.countingPercentage}
            />

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-slate-400">{data.province.region.nameTh}</p>
                        <h1 className="text-2xl font-bold text-white">
                            {data.province.nameTh} เขต {data.constituencyNumber}
                        </h1>
                        <p className="text-sm text-slate-400">ความคืบหน้า {data.countingProgress.toFixed(1)}% | ผู้มาใช้สิทธิ {data.totalVoters.toLocaleString('th-TH')} คน</p>
                    </div>
                    <Link
                        href="/map"
                        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:border-blue-500"
                    >
                        กลับไปหน้าแผนที่
                    </Link>
                </div>

                <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5">
                    <h2 className="text-base font-semibold text-white mb-4">ผลคะแนนผู้สมัคร</h2>
                    <div className="space-y-3">
                        {data.results.map((result) => (
                            <div key={result.candidateId} className="rounded-xl border border-slate-700/60 bg-slate-950/70 p-3">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-semibold text-white">
                                            หมายเลข {result.candidate.candidateNumber} {result.candidate.nameTh}
                                        </p>
                                        <p className="text-xs text-slate-400">{result.party.nameTh}</p>
                                    </div>
                                    <p className="font-semibold text-slate-200">{result.voteCount.toLocaleString('th-TH')} คะแนน</p>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${Math.max(3, (result.voteCount / topVotes) * 100)}%`,
                                            backgroundColor: result.party.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
