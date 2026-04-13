'use client';

import { useState, useCallback } from 'react';
import { IOverviewSummary } from '@election/shared';
import { useElectionSocket } from '@/hooks/useElectionSocket';
import { useElectionData } from '@/hooks/useElectionData';
import HeroSection from './HeroSection';
import TopPartiesCard from './TopPartiesCard';
import PartyLeaderboard from './PartyLeaderboard';
import ReferendumWidget from './ReferendumWidget';
import CountingProgress from './CountingProgress';
import { MOCK_TICKER_ITEMS } from '@/lib/mockData';
import LiveTicker from './LiveTicker';
import MapSectionPreview from './MapSectionPreview';

interface DynamicSectionRendererProps {
    initialData: IOverviewSummary;
}

export default function DynamicSectionRenderer({ initialData }: DynamicSectionRendererProps) {
    const { data } = useElectionData(initialData);

    // Apply WebSocket updates on top of polling
    const [liveData, setLiveData] = useState<IOverviewSummary>(initialData);

    const handleOverviewUpdate = useCallback(
        (updater: (prev: IOverviewSummary) => IOverviewSummary) => {
            setLiveData((prev) => updater(prev));
        },
        [],
    );

    // Merge polling data into liveData
    const mergedData: IOverviewSummary = {
        ...data,
        sections: liveData.sections,
    };

    useElectionSocket({ onOverviewUpdate: handleOverviewUpdate });

    // Build enabled sections map
    const sections = new Map(mergedData.sections.map((s) => [s.sectionKey, s]));
    const isEnabled = (key: string) => sections.get(key)?.isEnabled ?? false;

    // Sort sections by displayOrder
    const sorted = [...mergedData.sections].sort((a, b) => a.displayOrder - b.displayOrder);

    return (
        <>
            {/* Live Ticker always on top */}
            {isEnabled('live_ticker') && <LiveTicker items={MOCK_TICKER_ITEMS} />}

            {sorted.map((section) => {
                if (!section.isEnabled) return null;

                switch (section.sectionKey) {
                    case 'hero_banner':
                        return <HeroSection key={section.sectionKey} data={mergedData} />;

                    case 'top_parties':
                        return <TopPartiesCard key={section.sectionKey} parties={mergedData.parties} />;

                    case 'referendum':
                        if (!mergedData.election.hasReferendum || !mergedData.referendum?.length) {
                            return null;
                        }
                        return (
                            <ReferendumWidget
                                key={section.sectionKey}
                                referendums={mergedData.referendum}
                            />
                        );

                    case 'party_leaderboard':
                        return (
                            <PartyLeaderboard
                                key={section.sectionKey}
                                parties={mergedData.parties}
                            />
                        );

                    case 'counting_progress':
                        return <CountingProgress key={section.sectionKey} data={mergedData} />;

                    // These sections are placeholders for future phases
                    case 'map_view':
                        return <MapSectionPreview key={section.sectionKey} data={mergedData} />;

                    case 'coalition_simulator':
                        return (
                            <PlaceholderSection
                                key={section.sectionKey}
                                title={section.titleTh}
                                subtitle="จำลองจัดตั้งรัฐบาลจะพร้อมใช้งานใน Phase 7"
                            />
                        );

                    case 'live_ticker':
                        return null; // rendered above

                    default:
                        return null;
                }
            })}
        </>
    );
}

function PlaceholderSection({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 text-center">
                <p className="text-slate-400 font-medium">{title}</p>
                <p className="text-slate-600 text-sm mt-1">{subtitle}</p>
            </div>
        </section>
    );
}
