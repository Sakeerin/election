'use client';

import { useMemo, useState } from 'react';
import { IOverviewSummary } from '@election/shared';
import { Activity } from 'lucide-react';
import { getMapProvinces, getMapRegions, VoteType } from '@/lib/mapData';
import { useMapData } from '@/hooks/useMapData';
import { useMapVoteTypeData } from '@/hooks/useMapVoteTypeData';
import VoteTypeToggle from '@/components/map/VoteTypeToggle';
import RegionFilter from '@/components/map/RegionFilter';
import ThailandMap from '@/components/map/ThailandMap';
import ConstituencyHexGrid from '@/components/map/ConstituencyHexGrid';
import ConstituencyDetail from '@/components/map/ConstituencyDetail';
import MapLegend from '@/components/map/MapLegend';
import HeatMap from '@/components/map/HeatMap';
import CloseRaceIndicator from '@/components/map/CloseRaceIndicator';

interface MapViewPageProps {
    overview: IOverviewSummary;
}

export default function MapViewPage({ overview }: MapViewPageProps) {
    const [voteType, setVoteType] = useState<VoteType>('constituency');
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | null>(null);

    const { constituencies, closeRaces, isLive } = useMapData(overview.parties, {
        selectedProvinceId,
        selectedConstituencyId,
    });
    const { partyListByProvince, referendumByProvince } = useMapVoteTypeData(
        voteType,
        overview.parties,
        overview.referendum,
    );
    const regions = useMemo(() => getMapRegions(), []);
    const provinces = useMemo(() => getMapProvinces(), []);

    const filtered = useMemo(() => {
        return constituencies.filter((item) => {
            const matchesRegion = selectedRegionId ? item.regionId === selectedRegionId : true;
            const matchesProvince = selectedProvinceId ? item.provinceId === selectedProvinceId : true;
            const search = searchValue.trim().toLowerCase();
            const matchesSearch =
                search.length === 0
                    ? true
                    : `${item.provinceName} เขต ${item.constituencyNumber}`.toLowerCase().includes(search);
            return matchesRegion && matchesProvince && matchesSearch;
        });
    }, [constituencies, searchValue, selectedProvinceId, selectedRegionId]);

    const selectedConstituency = useMemo(() => {
        const fromSelection = filtered.find((item) => item.id === selectedConstituencyId);
        return fromSelection ?? filtered[0] ?? null;
    }, [filtered, selectedConstituencyId]);

    return (
        <main className="pt-24 pb-10">
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">แผนที่ผลเลือกตั้งรายเขต</h1>
                        <p className="text-sm text-slate-400">มุมมอง choropleth + hex grid พร้อมไฮไลต์เขตสูสี</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${isLive ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
                        <Activity size={14} className={isLive ? 'animate-pulse' : ''} />
                        {isLive ? 'LIVE DATA' : 'USING MOCK DATA'}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <VoteTypeToggle value={voteType} onChange={setVoteType} />
                    {voteType !== 'constituency' && (
                        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                            โหมด {voteType === 'party_list' ? 'บัญชีรายชื่อ' : 'ประชามติ'} แสดงภาพรวมเชิงเปรียบเทียบจากข้อมูลชุดเดียวกัน
                        </div>
                    )}
                </div>

                <RegionFilter
                    regions={regions}
                    provinces={provinces}
                    selectedRegionId={selectedRegionId}
                    selectedProvinceId={selectedProvinceId}
                    searchValue={searchValue}
                    onRegionChange={setSelectedRegionId}
                    onProvinceChange={setSelectedProvinceId}
                    onSearchChange={setSearchValue}
                />

                <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
                    <div className="xl:col-span-8 space-y-4">
                        <ThailandMap
                            provinces={provinces}
                            constituencies={filtered}
                            voteType={voteType}
                            partyListByProvince={partyListByProvince}
                            referendumByProvince={referendumByProvince}
                            selectedProvinceId={selectedProvinceId}
                            onProvinceSelect={setSelectedProvinceId}
                        />
                        <ConstituencyHexGrid
                            constituencies={filtered}
                            selectedConstituencyId={selectedConstituency?.id ?? null}
                            onSelect={setSelectedConstituencyId}
                        />
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                        <ConstituencyDetail constituency={selectedConstituency} />
                        <MapLegend parties={overview.parties} />
                        <HeatMap constituencies={filtered} provinces={provinces} />
                        <CloseRaceIndicator races={closeRaces.filter((race) => filtered.some((item) => item.id === race.id))} />
                    </div>
                </div>
            </section>
        </main>
    );
}
