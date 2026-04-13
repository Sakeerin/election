'use client';

import { motion } from 'framer-motion';
import { IPartySummary } from '@election/shared';
import { TOTAL_SEATS } from '@election/shared';
import { formatNumber } from '@/lib/utils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface TopPartiesCardProps {
    parties: IPartySummary[];
}

const MEDAL_COLORS = ['#F59E0B', '#94A3B8', '#C77E4C'];
const MEDAL_LABELS = ['อันดับ 1', 'อันดับ 2', 'อันดับ 3'];

export default function TopPartiesCard({ parties }: TopPartiesCardProps) {
    const top3 = [...parties].sort((a, b) => b.totalSeats - a.totalSeats).slice(0, 3);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">พรรคอันดับต้น</h2>
                <span className="text-xs text-slate-500 bg-slate-800 rounded-full px-3 py-1">
                    TOP 3
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {top3.map((p, i) => (
                    <TopPartyCard
                        key={p.party.id}
                        summary={p}
                        rank={i + 1}
                        medalColor={MEDAL_COLORS[i]}
                        medalLabel={MEDAL_LABELS[i]}
                        delay={i * 0.1}
                    />
                ))}
            </div>
        </section>
    );
}

function TopPartyCard({
    summary,
    rank,
    medalColor,
    medalLabel,
    delay,
}: {
    summary: IPartySummary;
    rank: number;
    medalColor: string;
    medalLabel: string;
    delay: number;
}) {
    const { party, totalSeats, constituencySeats, partyListSeats, totalVotes } = summary;
    const seatPct = ((totalSeats / TOTAL_SEATS) * 100).toFixed(1);
    const isFirst = rank === 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={`relative rounded-2xl p-6 border overflow-hidden ${
                isFirst
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-500/30'
                    : 'bg-slate-800/60 border-slate-700/50'
            }`}
        >
            {/* Background accent */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
                style={{ backgroundColor: party.color }}
            />

            {/* Medal */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{ backgroundColor: `${medalColor}20`, color: medalColor }}
                >
                    {rank}
                </div>
                <span className="text-xs text-slate-500">{medalLabel}</span>
            </div>

            {/* Party color bar */}
            <div
                className="w-12 h-1 rounded-full mb-3"
                style={{ backgroundColor: party.color }}
            />

            {/* Party name */}
            <h3 className="text-xl font-bold text-white mb-0.5">{party.nameTh}</h3>
            {party.leaderName && (
                <p className="text-slate-400 text-xs mb-4">{party.leaderName}</p>
            )}

            {/* Total seats - big number */}
            <div className="mb-4 flex items-baseline gap-1" style={{ color: party.color }}>
                <AnimatedCounter
                    value={totalSeats}
                    className="text-4xl font-bold"
                />
                <span className="text-slate-400 text-sm" style={{ color: 'inherit' }}>ที่นั่ง</span>
            </div>

            {/* Seat breakdown bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${seatPct}%`,
                        backgroundColor: party.color,
                    }}
                />
            </div>
            <p className="text-slate-400 text-xs mb-4">{seatPct}% ของที่นั่งทั้งหมด</p>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-white font-semibold text-sm">{formatNumber(constituencySeats)}</p>
                    <p className="text-slate-500 text-[10px]">สส.เขต</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <p className="text-white font-semibold text-sm">{formatNumber(partyListSeats)}</p>
                    <p className="text-slate-500 text-[10px]">สส.บัญชี</p>
                </div>
            </div>

            {/* Votes */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-slate-400 text-xs">
                    คะแนนเสียง{' '}
                    <span className="text-white font-medium">{formatNumber(totalVotes)}</span>
                </p>
            </div>
        </motion.div>
    );
}
