'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
    IOverviewSummary,
    IPartySummary,
    WsCountingProgress,
    WsPartyUpdated,
    WsSectionToggled,
    WsVoteUpdated,
} from '@election/shared';
import { WS_EVENTS } from '@election/shared';
import { getSocket } from '@/lib/socket';

interface UseElectionSocketOptions {
    onVoteUpdated?: (payload: WsVoteUpdated) => void;
    onPartyUpdated?: (payload: WsPartyUpdated) => void;
    onCountingProgress?: (payload: WsCountingProgress) => void;
    onSectionToggled?: (payload: WsSectionToggled) => void;
    onOverviewUpdate?: (updater: (prev: IOverviewSummary) => IOverviewSummary) => void;
}

export function useElectionSocket(options: UseElectionSocketOptions = {}) {
    const optionsRef = useRef(options);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const connect = useCallback(() => {
        try {
            const socket = getSocket();

            socket.on(WS_EVENTS.VOTE_UPDATED, (payload: WsVoteUpdated) => {
                optionsRef.current.onVoteUpdated?.(payload);
            });

            socket.on(WS_EVENTS.PARTY_UPDATED, (payload: WsPartyUpdated) => {
                optionsRef.current.onPartyUpdated?.(payload);
                optionsRef.current.onOverviewUpdate?.((prev) => ({
                    ...prev,
                    parties: prev.parties.map((p): IPartySummary =>
                        p.party.id === payload.partyId
                            ? {
                                  ...p,
                                  totalSeats: payload.totalSeats,
                                  constituencySeats: payload.constituencySeats,
                                  partyListSeats: payload.partyListSeats,
                              }
                            : p,
                    ),
                }));
            });

            socket.on(WS_EVENTS.COUNTING_PROGRESS, (payload: WsCountingProgress) => {
                optionsRef.current.onCountingProgress?.(payload);
                optionsRef.current.onOverviewUpdate?.((prev) => ({
                    ...prev,
                    totalCounted: payload.totalCounted,
                    countingPercentage: payload.percentage,
                }));
            });

            socket.on(WS_EVENTS.SECTION_TOGGLED, (payload: WsSectionToggled) => {
                optionsRef.current.onSectionToggled?.(payload);
                optionsRef.current.onOverviewUpdate?.((prev) => ({
                    ...prev,
                    sections: prev.sections.map((s) =>
                        s.sectionKey === payload.sectionKey
                            ? { ...s, isEnabled: payload.isEnabled }
                            : s,
                    ),
                }));
            });

            return socket;
        } catch {
            return null;
        }
    }, []);

    useEffect(() => {
        const socket = connect();
        return () => {
            if (socket) {
                socket.off(WS_EVENTS.PARTY_UPDATED);
                socket.off(WS_EVENTS.COUNTING_PROGRESS);
                socket.off(WS_EVENTS.SECTION_TOGGLED);
                socket.off(WS_EVENTS.VOTE_UPDATED);
            }
        };
    }, [connect]);
}
