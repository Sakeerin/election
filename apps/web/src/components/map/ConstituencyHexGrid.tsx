'use client';

import { motion } from 'framer-motion';
import { MapConstituency } from '@/lib/mapData';

interface ConstituencyHexGridProps {
    constituencies: MapConstituency[];
    selectedConstituencyId: number | null;
    onSelect: (constituencyId: number) => void;
}

export default function ConstituencyHexGrid({
    constituencies,
    selectedConstituencyId,
    onSelect,
}: ConstituencyHexGridProps) {
    return (
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Constituency Hex Grid</h3>
                <p className="text-xs text-slate-400">{constituencies.length.toLocaleString('th-TH')} เขต</p>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 xl:grid-cols-16 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                {constituencies.map((constituency) => {
                    const selected = constituency.id === selectedConstituencyId;
                    return (
                        <motion.button
                            key={constituency.id}
                            type="button"
                            layout
                            whileHover={{ scale: 1.08 }}
                            onClick={() => onSelect(constituency.id)}
                            className={`relative aspect-square rounded-md border text-[10px] font-semibold text-white transition-all ${
                                selected
                                    ? 'border-white shadow-md shadow-white/20'
                                    : 'border-slate-900/70 hover:border-slate-200/50'
                            }`}
                            style={{
                                backgroundColor: constituency.leadingPartyColor,
                                opacity: 0.35 + constituency.countingProgress / 160,
                            }}
                            title={`${constituency.provinceName} เขต ${constituency.constituencyNumber}`}
                        >
                            <span className="absolute inset-0 flex items-center justify-center">{constituency.id}</span>
                            {constituency.isCloseRace && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}
