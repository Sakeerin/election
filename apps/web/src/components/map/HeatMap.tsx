import { scaleLinear } from 'd3-scale';
import { MapConstituency, MapProvince } from '@/lib/mapData';

interface HeatMapProps {
    constituencies: MapConstituency[];
    provinces: MapProvince[];
}

export default function HeatMap({ constituencies, provinces }: HeatMapProps) {
    const byProvince = provinces
        .map((province) => {
            const rows = constituencies.filter((item) => item.provinceId === province.id);
            const turnout = rows.length > 0 ? rows.reduce((sum, item) => sum + item.turnoutPct, 0) / rows.length : 0;
            return {
                province,
                turnout,
            };
        })
        .filter((item) => item.turnout > 0)
        .sort((a, b) => b.turnout - a.turnout)
        .slice(0, 12);

    const heat = scaleLinear<string>().domain([50, 85]).range(['#1e293b', '#f97316']).clamp(true);

    return (
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">HeatMap ผู้มาใช้สิทธิ</h3>
            <div className="space-y-2">
                {byProvince.map((item) => (
                    <div key={item.province.id} className="flex items-center gap-2">
                        <div className="w-24 text-xs text-slate-300 truncate">{item.province.nameTh}</div>
                        <div className="h-2.5 flex-1 rounded-full" style={{ backgroundColor: heat(item.turnout) }} />
                        <div className="w-12 text-right text-xs font-semibold text-slate-200">
                            {item.turnout.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
