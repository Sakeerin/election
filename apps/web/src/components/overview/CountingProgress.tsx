'use client';

import { motion } from 'framer-motion';
import { IOverviewSummary } from '@election/shared';
import { REGIONS } from '@election/shared';
import { formatNumber } from '@/lib/utils';

interface CountingProgressProps {
    data: IOverviewSummary;
}

// Rough region seat distribution (mock — real data comes from API per region)
const REGION_MOCK = [
    { id: 7, counted: 30, total: 33, progress: 91 },   // Bangkok
    { id: 1, counted: 68, total: 89, progress: 76 },   // Central
    { id: 2, counted: 42, total: 51, progress: 82 },   // North
    { id: 3, counted: 74, total: 132, progress: 56 },  // Northeast
    { id: 4, counted: 21, total: 26, progress: 81 },   // East
    { id: 5, counted: 18, total: 21, progress: 86 },   // West
    { id: 6, counted: 59, total: 48, progress: 100 },  // South — clamp later
];

export default function CountingProgress({ data }: CountingProgressProps) {
    const { totalCounted, countingPercentage } = data;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">ความคืบหน้าการนับคะแนน</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            นับแล้ว{' '}
                            <span className="text-white font-semibold">{formatNumber(totalCounted)}</span>
                            {' '}เขต จาก 400 เขตทั่วประเทศ
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
                        <span className="text-3xl font-bold text-blue-400">{countingPercentage}%</span>
                    </div>
                </div>

                {/* Overall progress bar */}
                <div className="mb-8">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${countingPercentage}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Regional breakdown */}
                <h3 className="text-sm font-medium text-slate-300 mb-4">แยกตามภูมิภาค</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REGION_MOCK.map((region) => {
                        const regionInfo = REGIONS.find((r) => r.id === region.id);
                        if (!regionInfo) return null;
                        const pct = Math.min(100, region.progress);
                        return (
                            <RegionCard
                                key={region.id}
                                nameTh={regionInfo.nameTh}
                                counted={Math.min(region.counted, region.total)}
                                total={region.total}
                                progress={pct}
                            />
                        );
                    })}
                </div>

                {/* Status legend */}
                <div className="flex gap-4 mt-6 pt-4 border-t border-slate-700/50">
                    {[
                        { color: 'bg-green-500', label: 'นับเสร็จ' },
                        { color: 'bg-blue-500', label: 'กำลังนับ' },
                        { color: 'bg-slate-600', label: 'รอนับ' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                            <span className="text-slate-400 text-xs">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function RegionCard({
    nameTh,
    counted,
    total,
    progress,
}: {
    nameTh: string;
    counted: number;
    total: number;
    progress: number;
}) {
    const isComplete = progress >= 100;
    return (
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
            <div className="flex justify-between items-start mb-3">
                <p className="text-slate-200 font-medium text-sm">{nameTh}</p>
                <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                        isComplete
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-blue-500/15 text-blue-400'
                    }`}
                >
                    {isComplete ? 'เสร็จ' : 'นับอยู่'}
                </span>
            </div>

            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                <motion.div
                    className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            <div className="flex justify-between text-xs text-slate-400">
                <span>
                    {counted}/{total} เขต
                </span>
                <span className={isComplete ? 'text-green-400' : 'text-blue-400'}>
                    {progress}%
                </span>
            </div>
        </div>
    );
}
