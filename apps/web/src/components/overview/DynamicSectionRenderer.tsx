'use client';

import { useState, useCallback, ReactNode } from 'react';
import { IElectionSection, IOverviewSummary } from '@election/shared';
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
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
            {/* Live Ticker always on top; if it crashes, just hide it */}
            {isEnabled('live_ticker') && (
                <ErrorBoundary fallback={null}>
                    <LiveTicker items={MOCK_TICKER_ITEMS} />
                </ErrorBoundary>
            )}

            {sorted.map((section) => {
                if (!section.isEnabled) return null;

                const content = renderSection(section, mergedData);
                if (!content) return null;

                // Isolate each section so one crashing component doesn't blank the whole page
                return (
                    <ErrorBoundary
                        key={section.sectionKey}
                        fallback={
                            <PlaceholderSection
                                title={section.titleTh}
                                subtitle="ส่วนนี้แสดงผลไม่ได้ชั่วคราว กรุณารีเฟรชหน้า"
                            />
                        }
                    >
                        {content}
                    </ErrorBoundary>
                );
            })}
        </>
    );
}

function renderSection(section: IElectionSection, data: IOverviewSummary): ReactNode {
    switch (section.sectionKey) {
        case 'hero_banner':
            return <HeroSection data={data} />;

        case 'top_parties':
            return <TopPartiesCard parties={data.parties} />;

        case 'referendum':
            if (!data.election.hasReferendum || !data.referendum?.length) {
                return null;
            }
            return <ReferendumWidget referendums={data.referendum} />;

        case 'party_leaderboard':
            return <PartyLeaderboard parties={data.parties} />;

        case 'counting_progress':
            return <CountingProgress data={data} />;

        // These sections are placeholders for future phases
        case 'map_view':
            return <MapSectionPreview data={data} />;

        case 'coalition_simulator':
            return (
                <PlaceholderSection
                    title={section.titleTh}
                    subtitle="จำลองจัดตั้งรัฐบาลจะพร้อมใช้งานใน Phase 7"
                />
            );

        case 'live_ticker':
            return null; // rendered above

        default:
            return null;
    }
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
