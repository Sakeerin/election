'use client';

import { IOverviewSummary } from '@election/shared';
import { TOTAL_SEATS } from '@election/shared';
import { formatThaiDate } from '@/lib/utils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import ProgressRing from '@/components/ui/ProgressRing';
import SeatBar from '@/components/ui/SeatBar';

interface HeroSectionProps {
    data: IOverviewSummary;
}

export default function HeroSection({ data }: HeroSectionProps) {
    const { election, totalCounted, countingPercentage, parties } = data;
    const totalVotes = parties.reduce((sum, p) => sum + p.totalVotes, 0);
    const voterTurnout =
        election.totalEligibleVoters > 0
            ? ((totalVotes / election.totalEligibleVoters) * 100).toFixed(2)
            : '0.00';

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 pt-28 pb-12">
            {/* Decorative background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-blue-300 text-sm font-medium">รายงานผลเรียลไทม์</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-3xl mx-auto">
                        {election.name}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        วันที่ {formatThaiDate(election.electionDate)}
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Progress Ring — left */}
                    <div className="flex flex-col items-center gap-4">
                        <ProgressRing
                            percentage={countingPercentage}
                            size={160}
                            strokeWidth={12}
                            color="#3b82f6"
                            label={`${countingPercentage}%`}
                            sublabel="นับแล้ว"
                        />
                        <div className="text-center">
                            <p className="text-slate-300 text-sm">
                                <span className="text-white font-semibold text-lg">{totalCounted}</span>
                                {' '}เขต จาก{' '}
                                <span className="text-slate-400">400</span>
                                {' '}เขต
                            </p>
                        </div>
                    </div>

                    {/* Seat bar + stats — center */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <StatCard
                                label="ที่นั่งทั้งหมด"
                                value={TOTAL_SEATS}
                                highlight={false}
                            />
                            <StatCard
                                label="ผู้มาใช้สิทธิ์"
                                value={Number(voterTurnout)}
                                suffix="%"
                                highlight={false}
                                isPercent
                            />
                            <StatCard
                                label="ผู้มีสิทธิ์เลือกตั้ง"
                                value={election.totalEligibleVoters}
                                highlight={false}
                                className="col-span-2 sm:col-span-1"
                            />
                        </div>

                        {/* Parliament composition bar */}
                        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                            <p className="text-slate-300 text-sm font-medium mb-4">
                                การกระจายที่นั่งในสภา
                            </p>
                            <SeatBar parties={parties} />
                        </div>

                        {/* Party color legend — top 5 */}
                        <div className="flex flex-wrap gap-3">
                            {[...parties]
                                .sort((a, b) => b.totalSeats - a.totalSeats)
                                .slice(0, 5)
                                .map((p) => (
                                    <div key={p.party.id} className="flex items-center gap-1.5">
                                        <div
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: p.party.color }}
                                        />
                                        <span className="text-xs text-slate-400">{p.party.nameTh}</span>
                                        <span className="text-xs text-white font-semibold">
                                            {p.totalSeats}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatCard({
    label,
    value,
    suffix,
    highlight,
    isPercent,
    className,
}: {
    label: string;
    value: number;
    suffix?: string;
    highlight: boolean;
    isPercent?: boolean;
    className?: string;
}) {
    return (
        <div
            className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center ${className ?? ''} ${
                highlight ? 'ring-1 ring-blue-500/50' : ''
            }`}
        >
            <AnimatedCounter
                value={value}
                className="text-2xl font-bold text-white"
                formatter={
                    isPercent
                        ? (v) => `${v.toFixed(2)}${suffix ?? ''}`
                        : (v) => `${Math.round(v).toLocaleString('th-TH')}${suffix ?? ''}`
                }
            />
            <p className="text-slate-400 text-xs mt-1">{label}</p>
        </div>
    );
}
