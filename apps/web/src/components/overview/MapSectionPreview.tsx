import Link from 'next/link';
import { IOverviewSummary } from '@election/shared';

interface MapSectionPreviewProps {
    data: IOverviewSummary;
}

export default function MapSectionPreview({ data }: MapSectionPreviewProps) {
    const topLeaders = [...data.parties].slice(0, 5);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Phase 5</p>
                        <h2 className="text-xl font-bold text-white">แผนที่ผลเลือกตั้งรายเขตพร้อมดูรายละเอียดเขต</h2>
                        <p className="mt-1 text-sm text-slate-400">รองรับกรองภูมิภาค/จังหวัด, hex grid 400 เขต, heatmap ผู้มาใช้สิทธิ และตัวชี้วัดเขตสูสี</p>
                    </div>
                    <Link
                        href="/map"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-500/40 bg-blue-500/15 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/25"
                    >
                        เปิดหน้าแผนที่
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {topLeaders.map((party) => (
                        <div key={party.party.id} className="rounded-lg border border-slate-700/70 bg-slate-950/70 px-3 py-2">
                            <p className="text-xs text-slate-400">แนวโน้มผู้นำ</p>
                            <p className="truncate text-sm font-semibold text-white">{party.party.nameTh}</p>
                            <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                                <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(100, (party.totalSeats / 250) * 100)}%`,
                                        backgroundColor: party.party.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
