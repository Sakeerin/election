'use client';

import { geoMercator, geoPath } from 'd3-geo';
import { useEffect, useMemo, useState } from 'react';
import { MapConstituency, MapProvince, VoteType } from '@/lib/mapData';
import { PartyListProvinceLeader, ReferendumProvinceSummary } from '@/hooks/useMapVoteTypeData';

interface ThailandMapProps {
    provinces: MapProvince[];
    constituencies: MapConstituency[];
    voteType: VoteType;
    partyListByProvince: Map<number, PartyListProvinceLeader>;
    referendumByProvince: Map<number, ReferendumProvinceSummary>;
    selectedProvinceId: number | null;
    onProvinceSelect: (provinceId: number | null) => void;
}

interface ProvinceSummary {
    province: MapProvince;
    constituencyCount: number;
    avgProgress: number;
    leadColor: string;
    leadPartyName: string;
    turnoutPct: number;
}

interface ThailandGeoFeature {
    type: 'Feature';
    properties: {
        name: string;
    };
    geometry: {
        type: string;
        coordinates: unknown;
    };
}

interface ThailandGeoJson {
    type: 'FeatureCollection';
    features: ThailandGeoFeature[];
}

const PROVINCE_NAME_ALIAS: Record<string, string> = {
    'Phra Nakhon Si Ayutthaya': 'Ayutthaya',
    'Nakhon Ratchasima': 'Nakhon Ratchasima',
    'Nakhon Si Thammarat': 'Nakhon Si Thammarat',
};

export default function ThailandMap({
    provinces,
    constituencies,
    voteType,
    partyListByProvince,
    referendumByProvince,
    selectedProvinceId,
    onProvinceSelect,
}: ThailandMapProps) {
    const [geoJson, setGeoJson] = useState<ThailandGeoJson | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState<ProvinceSummary | null>(null);
    const [hoveredName, setHoveredName] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let active = true;

        fetch('/maps/thailand-provinces.geojson')
            .then((response) => response.json())
            .then((json: ThailandGeoJson) => {
                if (active) {
                    setGeoJson(json);
                }
            })
            .catch(() => {
                // Keep fallback view if geojson is unavailable
            });

        return () => {
            active = false;
        };
    }, []);

    const provinceByName = useMemo(() => {
        const map = new Map<string, MapProvince>();
        for (const province of provinces) {
            map.set(province.nameEn.toLowerCase(), province);
        }
        return map;
    }, [provinces]);

    const summaryByProvince = useMemo(() => {
        const grouped = new Map<number, MapConstituency[]>();
        for (const constituency of constituencies) {
            const arr = grouped.get(constituency.provinceId) ?? [];
            arr.push(constituency);
            grouped.set(constituency.provinceId, arr);
        }

        return provinces
            .map((province): ProvinceSummary => {
                const items = grouped.get(province.id) ?? [];
                const avgProgress =
                    items.length > 0
                        ? items.reduce((sum, item) => sum + item.countingProgress, 0) / items.length
                        : 0;
                const avgTurnout =
                    items.length > 0
                        ? items.reduce((sum, item) => sum + item.turnoutPct, 0) / items.length
                        : 0;

                const partyWins = new Map<number, { color: string; name: string; wins: number }>();
                for (const item of items) {
                    const current = partyWins.get(item.leadingPartyId) ?? {
                        color: item.leadingPartyColor,
                        name: item.leadingPartyName,
                        wins: 0,
                    };
                    current.wins += 1;
                    partyWins.set(item.leadingPartyId, current);
                }

                const leader = Array.from(partyWins.values()).sort((a, b) => b.wins - a.wins)[0];

                return {
                    province,
                    constituencyCount: items.length,
                    avgProgress,
                    turnoutPct: avgTurnout,
                    leadColor: leader?.color ?? '#475569',
                    leadPartyName: leader?.name ?? 'ไม่มีข้อมูล',
                };
            })
            .filter((item) => item.constituencyCount > 0);
    }, [constituencies, provinces]);

    const summaryMap = useMemo(() => {
        const map = new Map<number, ProvinceSummary>();
        for (const item of summaryByProvince) {
            map.set(item.province.id, item);
        }
        return map;
    }, [summaryByProvince]);

    const geoPaths = useMemo(() => {
        if (!geoJson) {
            return [];
        }

        const projection = geoMercator();
        projection.fitSize([920, 560], geoJson as never);
        const pathFactory = geoPath(projection);

        return geoJson.features
            .map((feature) => ({
                feature,
                d: pathFactory(feature as never) ?? '',
            }))
            .filter((item) => item.d.length > 0);
    }, [geoJson]);

    return (
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white">Thailand Map</h3>
                    <p className="text-xs text-slate-400">คลิกจังหวัดเพื่อเจาะลึกรายเขต | ลากเพื่อ pan | ปุ่ม + - เพื่อ zoom</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
                        className="h-8 w-8 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500"
                    >
                        -
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setZoom(1);
                            setPan({ x: 0, y: 0 });
                        }}
                        className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-blue-500"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(2.8, z + 0.2))}
                        className="h-8 w-8 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900">
                <svg
                    viewBox="0 0 920 560"
                    className="h-[330px] w-full cursor-grab select-none"
                    onMouseDown={(event) => {
                        setDragging(true);
                        setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
                    }}
                    onMouseMove={(event) => {
                        if (!dragging) {
                            return;
                        }
                        setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
                    }}
                    onMouseUp={() => setDragging(false)}
                    onMouseLeave={() => setDragging(false)}
                >
                    <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                        {geoPaths.map(({ feature, d }) => {
                            const alias = PROVINCE_NAME_ALIAS[feature.properties.name] ?? feature.properties.name;
                            const province = provinceByName.get(alias.toLowerCase());
                            const summary = province ? summaryMap.get(province.id) : undefined;
                            const isSelected = !!province && province.id === selectedProvinceId;
                            const partyListSummary = province ? partyListByProvince.get(province.id) : undefined;
                            const referendumSummary = province ? referendumByProvince.get(province.id) : undefined;

                            let fill = summary?.leadColor ?? '#334155';
                            if (voteType === 'party_list' && partyListSummary) {
                                fill = partyListSummary.partyColor;
                            }
                            if (voteType === 'referendum' && referendumSummary) {
                                fill = referendumSummary.approvePct >= 50 ? '#22c55e' : '#ef4444';
                            }

                            return (
                                <path
                                    key={feature.properties.name}
                                    d={d}
                                    fill={fill}
                                    fillOpacity={summary ? 0.78 : 0.35}
                                    stroke={isSelected ? '#f8fafc' : '#0f172a'}
                                    strokeWidth={isSelected ? 2.2 : 0.9}
                                    className="cursor-pointer transition-all duration-300 hover:brightness-110"
                                    onMouseEnter={() => {
                                        setHovered(summary ?? null);
                                        setHoveredName(feature.properties.name);
                                    }}
                                    onMouseLeave={() => {
                                        setHovered(null);
                                        setHoveredName(null);
                                    }}
                                    onClick={() => onProvinceSelect(province ? (isSelected ? null : province.id) : null)}
                                />
                            );
                        })}
                    </g>
                </svg>

                {(hovered || hoveredName) && (
                    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 shadow-xl">
                        <p className="font-semibold text-white">{hovered?.province.nameTh ?? hoveredName}</p>
                        {hovered ? (
                            <>
                                <p>เขตทั้งหมด {hovered.constituencyCount} เขต</p>
                                {voteType === 'party_list' ? (
                                    <p>
                                        พรรคคะแนนนำ (โหมดบัญชีรายชื่อ): {partyListByProvince.get(hovered.province.id)?.partyName ?? hovered.leadPartyName}
                                    </p>
                                ) : voteType === 'referendum' ? (
                                    <p>
                                        ผลเห็นชอบ: {referendumByProvince.get(hovered.province.id)?.approvePct.toFixed(1) ?? '0.0'}%
                                    </p>
                                ) : (
                                    <p>พรรคนำ: {hovered.leadPartyName}</p>
                                )}
                                <p>นับแล้วเฉลี่ย {hovered.avgProgress.toFixed(1)}%</p>
                                <p>ผู้มาใช้สิทธิเฉลี่ย {hovered.turnoutPct.toFixed(1)}%</p>
                            </>
                        ) : (
                            <p>ยังไม่มีข้อมูลเขตในชุดตัวอย่าง</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
