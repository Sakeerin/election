'use client';

import { motion } from 'framer-motion';
import { IPartySummary } from '@election/shared';
import { TOTAL_SEATS, GOVERNMENT_FORMATION_THRESHOLD } from '@election/shared';

interface SeatBarProps {
    parties: IPartySummary[];
}

export default function SeatBar({ parties }: SeatBarProps) {
    const totalAllocated = parties.reduce((sum, p) => sum + p.totalSeats, 0);
    const thresholdPct = (GOVERNMENT_FORMATION_THRESHOLD / TOTAL_SEATS) * 100;

    const sorted = [...parties].sort((a, b) => b.totalSeats - a.totalSeats);

    return (
        <div className="w-full">
            {/* Bar */}
            <div className="relative h-8 rounded-full overflow-hidden bg-slate-800 flex">
                {sorted.map((p, i) => {
                    const widthPct = (p.totalSeats / TOTAL_SEATS) * 100;
                    if (widthPct < 0.1) return null;
                    return (
                        <motion.div
                            key={p.party.id}
                            title={`${p.party.nameTh}: ${p.totalSeats} ที่นั่ง`}
                            className="h-full transition-all"
                            style={{ backgroundColor: p.party.color, width: `${widthPct}%` }}
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                        />
                    );
                })}
            </div>

            {/* Threshold line */}
            <div className="relative mt-1" style={{ marginLeft: `${thresholdPct}%` }}>
                <div className="absolute -translate-x-1/2 flex flex-col items-center">
                    <div className="w-px h-3 bg-yellow-400" />
                    <span className="text-[10px] text-yellow-400 whitespace-nowrap font-medium">
                        {GOVERNMENT_FORMATION_THRESHOLD} ที่นั่ง
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-slate-400 mt-5">
                <span>
                    นับแล้ว{' '}
                    <span className="text-white font-semibold">{totalAllocated}</span>
                    {' '}/ {TOTAL_SEATS} ที่นั่ง
                </span>
                <span>
                    เกณฑ์จัดตั้งรัฐบาล{' '}
                    <span className="text-yellow-400 font-semibold">{GOVERNMENT_FORMATION_THRESHOLD}</span>{' '}
                    ที่นั่ง
                </span>
            </div>
        </div>
    );
}
