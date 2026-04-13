'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { IPartySummary } from '@election/shared';
import { TOTAL_SEATS } from '@election/shared';
import { formatNumber } from '@/lib/utils';

type SortKey = 'rank' | 'totalSeats' | 'constituencySeats' | 'partyListSeats' | 'totalVotes';
type SortDir = 'asc' | 'desc';

interface PartyLeaderboardProps {
    parties: IPartySummary[];
}

export default function PartyLeaderboard({ parties }: PartyLeaderboardProps) {
    const [query, setQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('totalSeats');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return parties
            .filter(
                (p) =>
                    p.party.nameTh.includes(q) ||
                    p.party.nameEn.toLowerCase().includes(q) ||
                    p.party.abbreviation.includes(q),
            )
            .sort((a, b) => {
                const aVal = a[sortKey as keyof IPartySummary] as number;
                const bVal = b[sortKey as keyof IPartySummary] as number;
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            });
    }, [parties, query, sortKey, sortDir]);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-white flex-1">ตารางอันดับพรรค</h2>
                    <div className="relative max-w-xs w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="ค้นหาพรรค..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <Th label="#" sortKey="rank" current={sortKey} dir={sortDir} onSort={handleSort} className="w-12" />
                                <th className="text-left px-4 py-3 text-slate-400 font-medium">พรรค</th>
                                <Th label="เขต" sortKey="constituencySeats" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <Th label="บัญชี" sortKey="partyListSeats" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <Th label="รวม" sortKey="totalSeats" current={sortKey} dir={sortDir} onSort={handleSort} />
                                <Th label="คะแนนเสียง" sortKey="totalVotes" current={sortKey} dir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                                <th className="px-4 py-3 text-slate-400 font-medium text-right hidden md:table-cell">สัดส่วน</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                                {filtered.map((p, i) => {
                                    const seatPct = ((p.totalSeats / TOTAL_SEATS) * 100).toFixed(1);
                                    return (
                                        <motion.tr
                                            key={p.party.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                                        >
                                            {/* Rank */}
                                            <td className="px-4 py-3 text-slate-400 text-center font-medium">
                                                {i + 1}
                                            </td>

                                            {/* Party */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-sm flex-shrink-0"
                                                        style={{ backgroundColor: p.party.color }}
                                                    />
                                                    <div>
                                                        <p className="text-white font-medium">{p.party.nameTh}</p>
                                                        <p className="text-slate-500 text-xs">{p.party.abbreviation}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Constituency */}
                                            <td className="px-4 py-3 text-right text-slate-300">
                                                {formatNumber(p.constituencySeats)}
                                            </td>

                                            {/* Party list */}
                                            <td className="px-4 py-3 text-right text-slate-300">
                                                {formatNumber(p.partyListSeats)}
                                            </td>

                                            {/* Total seats */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-white font-bold">
                                                    {formatNumber(p.totalSeats)}
                                                </span>
                                            </td>

                                            {/* Votes */}
                                            <td className="px-4 py-3 text-right text-slate-400 hidden sm:table-cell">
                                                {formatNumber(p.totalVotes)}
                                            </td>

                                            {/* Seat % bar */}
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <div className="flex items-center gap-2 justify-end min-w-[100px]">
                                                    <div className="flex-1 max-w-[80px] h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${Math.min(100, (p.totalSeats / TOTAL_SEATS) * 100 * 5)}%`,
                                                                backgroundColor: p.party.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-slate-400 text-xs w-10 text-right">
                                                        {seatPct}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-500">ไม่พบพรรคที่ค้นหา</div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-700/50 text-slate-500 text-xs">
                    แสดง {filtered.length} จาก {parties.length} พรรค
                </div>
            </div>
        </section>
    );
}

function Th({
    label,
    sortKey,
    current,
    dir,
    onSort,
    className,
}: {
    label: string;
    sortKey: SortKey;
    current: SortKey;
    dir: SortDir;
    onSort: (k: SortKey) => void;
    className?: string;
}) {
    const active = current === sortKey;
    return (
        <th
            className={`px-4 py-3 text-right cursor-pointer select-none ${className ?? ''}`}
            onClick={() => onSort(sortKey)}
        >
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${active ? 'text-blue-400' : 'text-slate-400'}`}>
                {label}
                {active ? (
                    dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                ) : (
                    <ChevronsUpDown size={12} className="opacity-40" />
                )}
            </span>
        </th>
    );
}
