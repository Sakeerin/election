import { IPartySummary } from '@election/shared';

interface MapLegendProps {
    parties: IPartySummary[];
}

export default function MapLegend({ parties }: MapLegendProps) {
    const visible = [...parties].sort((a, b) => b.totalSeats - a.totalSeats).slice(0, 8);

    return (
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">สัญลักษณ์พรรค</h3>
            <div className="grid grid-cols-2 gap-2">
                {visible.map((partySummary) => (
                    <div key={partySummary.party.id} className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: partySummary.party.color }}
                        />
                        <span className="text-xs text-slate-300 truncate">{partySummary.party.nameTh}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
