import { api } from './api';
import { ICandidateDetail } from '@election/shared';

export async function fetchCandidateDetail(id: number): Promise<ICandidateDetail | null> {
    try {
        return await api.get<ICandidateDetail>(`/candidates/${id}/detail`, {
            next: { revalidate: 10 }
        });
    } catch (error) {
        console.error(`Error fetching candidate detail for ${id}:`, error);
        return null;
    }
}
