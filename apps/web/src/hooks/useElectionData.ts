'use client';

import { useEffect, useState, useCallback } from 'react';
import { IOverviewSummary } from '@election/shared';
import { api } from '@/lib/api';
const POLL_INTERVAL_MS = 15_000;

export function useElectionData(initialData: IOverviewSummary) {
    const [data, setData] = useState<IOverviewSummary>(initialData);
    const [isLive, setIsLive] = useState(false);

    const fetchLatest = useCallback(async () => {
        try {
            const fresh = await api.get<IOverviewSummary>('/summary/overview?electionId=1');
            setData(fresh);
            setIsLive(true);
        } catch {
            // Keep existing data; API might not be running yet
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchLatest, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLatest]);

    return { data, isLive };
}
