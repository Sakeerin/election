import { IOverviewSummary } from '@election/shared';
import { api } from '@/lib/api';
import { MOCK_OVERVIEW } from '@/lib/mockData';

/** Server-side fetch with ISR — falls back to mock data when API is offline. */
export async function fetchOverviewData(): Promise<IOverviewSummary> {
    try {
        return await api.get<IOverviewSummary>('/summary/overview', {
            // Backend currently expects electionId query param
            next: { revalidate: 10 },
        });
    } catch {
        try {
            return await api.get<IOverviewSummary>('/summary/overview?electionId=1', {
            next: { revalidate: 10 },
        });
        } catch {
        return MOCK_OVERVIEW;
        }
    }
}
