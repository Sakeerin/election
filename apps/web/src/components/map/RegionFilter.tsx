'use client';

import { MapProvince, MapRegion } from '@/lib/mapData';

interface RegionFilterProps {
    regions: MapRegion[];
    provinces: MapProvince[];
    selectedRegionId: number | null;
    selectedProvinceId: number | null;
    searchValue: string;
    onRegionChange: (regionId: number | null) => void;
    onProvinceChange: (provinceId: number | null) => void;
    onSearchChange: (value: string) => void;
}

export default function RegionFilter({
    regions,
    provinces,
    selectedRegionId,
    selectedProvinceId,
    searchValue,
    onRegionChange,
    onProvinceChange,
    onSearchChange,
}: RegionFilterProps) {
    const visibleProvinces = selectedRegionId
        ? provinces.filter((province) => province.regionId === selectedRegionId)
        : provinces;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
            <label className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">ภูมิภาค</span>
                <select
                    value={selectedRegionId ?? ''}
                    onChange={(event) => {
                        const value = event.target.value;
                        onRegionChange(value ? Number(value) : null);
                        onProvinceChange(null);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                    <option value="">ทุกภูมิภาค</option>
                    {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                            {region.nameTh}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">จังหวัด</span>
                <select
                    value={selectedProvinceId ?? ''}
                    onChange={(event) => onProvinceChange(event.target.value ? Number(event.target.value) : null)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                >
                    <option value="">ทุกจังหวัด</option>
                    {visibleProvinces.map((province) => (
                        <option key={province.id} value={province.id}>
                            {province.nameTh}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">ค้นหาเขต (auto-complete)</span>
                <input
                    list="province-search-options"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="เช่น กรุงเทพมหานคร เขต 12"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
                <datalist id="province-search-options">
                    {provinces.map((province) => (
                        <option key={province.id} value={province.nameTh} />
                    ))}
                </datalist>
            </label>
        </div>
    );
}
