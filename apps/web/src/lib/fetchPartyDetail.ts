import { api } from './api';
import { IPartyDetail } from '@election/shared';

export async function fetchPartyDetail(id: number): Promise<IPartyDetail | null> {
    try {
        return await api.get<IPartyDetail>(`/parties/${id}/detail`, {
            next: { revalidate: 10 }
        });
    } catch (error) {
        console.error(`Error fetching party detail for ${id}:`, error);
        return null;
    }
}
