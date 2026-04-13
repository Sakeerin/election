import Link from 'next/link';
import { MapConstituency } from '@/lib/mapData';

interface CloseRaceIndicatorProps {
    races: MapConstituency[];
}

export default function CloseRaceIndicator({ races }: CloseRaceIndicatorProps) {
    return (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <h3 className="text-sm font-semibold text-amber-200 mb-3">Close Race Indicator</h3>
            <div className="space-y-2">
                {races.slice(0, 8).map((race) => (
                    <Link
                        key={race.id}
                        href={`/constituency/${race.id}`}
                        className="flex items-center justify-between rounded-lg border border-amber-400/20 px-3 py-2 text-xs hover:bg-amber-300/10"
                    >
                        <span className="text-slate-100 truncate">
                            {race.provinceName} เขต {race.constituencyNumber}
                        </span>
                        <span className="font-semibold text-amber-200">{race.marginPct.toFixed(2)}%</span>
                    </Link>
                ))}
                {races.length === 0 && (
                    <p className="text-xs text-slate-400">ยังไม่พบเขตที่มีคะแนนห่างต่ำกว่า 5%</p>
                )}
            </div>
        </section>
    );
}
