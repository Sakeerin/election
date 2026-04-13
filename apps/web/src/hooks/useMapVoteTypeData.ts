'use client';

import { useEffect, useMemo, useState } from 'react';
import { IReferendum, IPartySummary } from '@election/shared';
import { api } from '@/lib/api';
import { getMapProvinces, VoteType } from '@/lib/mapData';

export interface PartyListProvinceLeader {
    provinceId: number;
    partyId: number;
    partyName: string;
    partyColor: string;
    voteSharePct: number;
}

export interface ReferendumProvinceSummary {
    provinceId: number;
    approveCount: number;
    disapproveCount: number;
    abstainCount: number;
    totalVoters: number;
    approvePct: number;
}

interface ProvinceSummaryResponse {
    province: {
        id: number;
    } | null;
    constituencies: Array<{
        results: Array<{
            voteCount: number;
            party: {
                id: number;
                nameTh: string;
                color: string;
            };
        }>;
    }>;
}

interface ReferendumDetailResponse {
    id: number;
    results: Array<{
        provinceId: number;
        approveCount: number;
        disapproveCount: number;
        abstainCount: number;
        totalVoters: number;
    }>;
}

export function useMapVoteTypeData(
    voteType: VoteType,
    parties: IPartySummary[],
    referendums: IReferendum[] | null,
) {
    const [partyListByProvince, setPartyListByProvince] = useState<Map<number, PartyListProvinceLeader>>(new Map());
    const [referendumByProvince, setReferendumByProvince] = useState<Map<number, ReferendumProvinceSummary>>(new Map());

    const enabledReferendumId = useMemo(
        () => referendums?.find((item) => item.isEnabled)?.id ?? null,
        [referendums],
    );

    useEffect(() => {
        if (voteType !== 'party_list') {
            return;
        }

        const provinces = getMapProvinces();
        let active = true;

        Promise.all(
            provinces.map((province) =>
                api
                    .get<ProvinceSummaryResponse>(`/summary/province/${province.id}?electionId=1`, {
                        cache: 'no-store',
                    })
                    .catch(() => null),
            ),
        )
            .then((responses) => {
                if (!active) {
                    return;
                }

                const next = new Map<number, PartyListProvinceLeader>();
                for (const response of responses) {
                    if (!response?.province) {
                        continue;
                    }

                    const votesByParty = new Map<number, { name: string; color: string; votes: number }>();
                    let totalVotes = 0;

                    for (const constituency of response.constituencies) {
                        for (const result of constituency.results) {
                            const current = votesByParty.get(result.party.id) ?? {
                                name: result.party.nameTh,
                                color: result.party.color,
                                votes: 0,
                            };
                            current.votes += result.voteCount;
                            votesByParty.set(result.party.id, current);
                            totalVotes += result.voteCount;
                        }
                    }

                    const leader = Array.from(votesByParty.entries()).sort((a, b) => b[1].votes - a[1].votes)[0];

                    if (!leader) {
                        continue;
                    }

                    next.set(response.province.id, {
                        provinceId: response.province.id,
                        partyId: leader[0],
                        partyName: leader[1].name,
                        partyColor: leader[1].color,
                        voteSharePct: totalVotes > 0 ? (leader[1].votes / totalVotes) * 100 : 0,
                    });
                }

                setPartyListByProvince(next);
            })
            .catch(() => {
                // Keep previous map data when API is unavailable
            });

        return () => {
            active = false;
        };
    }, [voteType]);

    useEffect(() => {
        if (voteType !== 'referendum' || !enabledReferendumId) {
            return;
        }

        let active = true;

        api
            .get<ReferendumDetailResponse>(`/referendums/${enabledReferendumId}`, {
                cache: 'no-store',
            })
            .then((response) => {
                if (!active) {
                    return;
                }

                const next = new Map<number, ReferendumProvinceSummary>();
                for (const result of response.results) {
                    const total = result.approveCount + result.disapproveCount + result.abstainCount;
                    next.set(result.provinceId, {
                        provinceId: result.provinceId,
                        approveCount: result.approveCount,
                        disapproveCount: result.disapproveCount,
                        abstainCount: result.abstainCount,
                        totalVoters: result.totalVoters,
                        approvePct: total > 0 ? (result.approveCount / total) * 100 : 0,
                    });
                }

                setReferendumByProvince(next);
            })
            .catch(() => {
                // Keep existing map when API is unavailable
            });

        return () => {
            active = false;
        };
    }, [enabledReferendumId, voteType]);

    const nationalPartyList = useMemo(() => parties, [parties]);

    return {
        partyListByProvince,
        referendumByProvince,
        nationalPartyList,
        enabledReferendumId,
    };
}
