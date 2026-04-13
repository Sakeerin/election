'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConstituencyStatus, IPartySummary, WsVoteUpdated } from '@election/shared';
import { api } from '@/lib/api';
import {
    MapConstituency,
    generateMockConstituencies,
    mapApiConstituenciesToMapData,
} from '@/lib/mapData';
import { useElectionSocket } from '@/hooks/useElectionSocket';
import { subscribeConstituency, subscribeProvince } from '@/lib/socket';

const POLL_INTERVAL_MS = 20_000;

interface ApiConstituencyRow {
    id: number;
    provinceId: number;
    constituencyNumber: number;
    eligibleVoters: number;
    totalVoters: number;
    countingProgress: number;
    status: ConstituencyStatus;
    province: {
        id: number;
        nameTh: string;
        regionId?: number;
    };
}

interface UseMapDataOptions {
    selectedProvinceId?: number | null;
    selectedConstituencyId?: number | null;
}

export function useMapData(parties: IPartySummary[], options: UseMapDataOptions = {}) {
    const [constituencies, setConstituencies] = useState<MapConstituency[]>(() =>
        generateMockConstituencies(400),
    );
    const [isLive, setIsLive] = useState(false);
    const { selectedProvinceId = null, selectedConstituencyId = null } = options;

    const fetchLatest = useCallback(async () => {
        try {
            const rows = await api.get<ApiConstituencyRow[]>('/constituencies?electionId=1');
            setConstituencies(mapApiConstituenciesToMapData(rows, parties));
            setIsLive(true);
        } catch {
            // Keep mock data while API is unavailable
        }
    }, [parties]);

    const handleVoteUpdated = useCallback((payload: WsVoteUpdated) => {
        const target = constituencies.find((item) => item.id === payload.constituencyId);
        const isRelevant =
            (selectedConstituencyId !== null && payload.constituencyId === selectedConstituencyId) ||
            (selectedProvinceId !== null && target?.provinceId === selectedProvinceId);

        if (!isRelevant) {
            return;
        }

        setConstituencies((prev) =>
            prev.map((item) => {
                if (item.id !== payload.constituencyId) {
                    return item;
                }

                const sorted = [...payload.results].sort((a, b) => b.voteCount - a.voteCount);
                const top = sorted[0];
                const second = sorted[1];

                if (!top) {
                    return item;
                }

                const totalVotes = sorted.reduce((sum, r) => sum + r.voteCount, 0);
                const marginPct =
                    top && second && totalVotes > 0
                        ? ((top.voteCount - second.voteCount) / totalVotes) * 100
                        : item.marginPct;

                const leadingParty = parties.find((party) => party.party.id === top.partyId)?.party;

                return {
                    ...item,
                    totalVoters: totalVotes,
                    marginPct,
                    isCloseRace: marginPct <= 5,
                    leadingPartyId: top.partyId,
                    leadingPartyName: leadingParty?.nameTh ?? item.leadingPartyName,
                    leadingPartyColor: leadingParty?.color ?? item.leadingPartyColor,
                };
            }),
        );
    }, [constituencies, parties, selectedConstituencyId, selectedProvinceId]);

    useElectionSocket({ onVoteUpdated: handleVoteUpdated });

    useEffect(() => {
        const interval = setInterval(fetchLatest, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLatest]);

    useEffect(() => {
        if (selectedProvinceId !== null) {
            subscribeProvince(selectedProvinceId);
        }
    }, [selectedProvinceId]);

    useEffect(() => {
        if (selectedConstituencyId !== null) {
            subscribeConstituency(selectedConstituencyId);
        }
    }, [selectedConstituencyId]);

    const closeRaces = useMemo(
        () => constituencies.filter((item) => item.isCloseRace).sort((a, b) => a.marginPct - b.marginPct),
        [constituencies],
    );

    return {
        constituencies,
        closeRaces,
        isLive,
    };
}
