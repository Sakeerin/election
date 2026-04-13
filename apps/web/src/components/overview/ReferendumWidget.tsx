'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IReferendum } from '@election/shared';
import { formatNumber } from '@/lib/utils';

interface ReferendumWidgetProps {
    referendums: IReferendum[];
}

export default function ReferendumWidget({ referendums }: ReferendumWidgetProps) {
    const enabled = referendums.filter((r) => r.isEnabled);
    if (enabled.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-xl font-bold text-white mb-6">ผลประชามติ</h2>
            <div className="grid grid-cols-1 gap-6">
                {enabled.map((ref) => (
                    <ReferendumCard key={ref.id} referendum={ref} />
                ))}
            </div>
        </section>
    );
}

function ReferendumCard({ referendum }: { referendum: IReferendum }) {
    const {
        questionTh,
        totalVoters,
        approveCount,
        disapproveCount,
        abstainCount,
        countingProgress,
    } = referendum;

    const total = approveCount + disapproveCount + abstainCount || 1;
    const approvePct = (approveCount / total) * 100;
    const disapprovePct = (disapproveCount / total) * 100;
    const abstainPct = (abstainCount / total) * 100;

    const pieData = [
        { name: 'เห็นชอบ', value: approveCount, color: '#22C55E' },
        { name: 'ไม่เห็นชอบ', value: disapproveCount, color: '#EF4444' },
        { name: 'งดออกเสียง', value: abstainCount, color: '#94A3B8' },
    ];

    const isApproved = approvePct > 50;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
        >
            {/* Question */}
            <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-3">
                    <span className="text-purple-300 text-xs font-medium">ประชามติ</span>
                </div>
                <p className="text-white font-medium leading-relaxed">{questionTh}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Donut chart */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <ResponsiveContainer width={220} height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    dataKey="value"
                                    strokeWidth={0}
                                    paddingAngle={2}
                                >
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#f1f5f9',
                                        fontSize: 12,
                                    }}
                                    formatter={(value: number) => [formatNumber(value), '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <span
                                className="text-2xl font-bold"
                                style={{ color: isApproved ? '#22C55E' : '#EF4444' }}
                            >
                                {approvePct.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-400">เห็นชอบ</span>
                        </div>
                    </div>

                    {/* Result badge */}
                    <div
                        className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
                            isApproved
                                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                    >
                        {isApproved ? '✓ เสียงส่วนใหญ่เห็นชอบ' : '✗ เสียงส่วนใหญ่ไม่เห็นชอบ'}
                    </div>
                </div>

                {/* Breakdown bars */}
                <div className="space-y-5">
                    {[
                        { label: 'เห็นชอบ', count: approveCount, pct: approvePct, color: '#22C55E', bg: 'bg-green-500' },
                        { label: 'ไม่เห็นชอบ', count: disapproveCount, pct: disapprovePct, color: '#EF4444', bg: 'bg-red-500' },
                        { label: 'งดออกเสียง', count: abstainCount, pct: abstainPct, color: '#94A3B8', bg: 'bg-slate-500' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span style={{ color: item.color }} className="font-medium">
                                    {item.label}
                                </span>
                                <span className="text-white font-semibold">
                                    {item.pct.toFixed(1)}%{' '}
                                    <span className="text-slate-400 font-normal text-xs">
                                        ({formatNumber(item.count)})
                                    </span>
                                </span>
                            </div>
                            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${item.bg}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.pct}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Footer stats */}
                    <div className="pt-3 border-t border-slate-700/50 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400 text-xs">ผู้มาใช้สิทธิ์</p>
                            <p className="text-white font-semibold">{formatNumber(totalVoters)}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">ความคืบหน้า</p>
                            <p className="text-white font-semibold">{countingProgress}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
