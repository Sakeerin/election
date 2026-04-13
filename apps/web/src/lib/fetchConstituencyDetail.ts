import { api } from '@/lib/api';
import { ConstituencyDetailData, getMockConstituencyDetail } from '@/lib/mapData';

interface ApiConstituencyDetail {
    id: number;
    constituencyNumber: number;
    status: ConstituencyDetailData['status'];
    countingProgress: number;
    eligibleVoters: number;
    totalVoters: number;
    goodBallots: number;
    badBallots: number;
    noVoteBallots: number;
    province: {
        id: number;
        nameTh: string;
        nameEn: string;
        code: string;
        region: {
            id: number;
            nameTh: string;
            nameEn: string;
        };
    };
    results: Array<{
        candidateId: number;
        partyId: number;
        voteCount: number;
        isLeading: boolean;
        isWinner: boolean;
        candidate: {
            id: number;
            candidateNumber: number;
            nameTh: string;
            nameEn: string;
        };
        party: {
            id: number;
            nameTh: string;
            abbreviation: string;
            color: string;
        };
    }>;
}

export async function fetchConstituencyDetail(id: number): Promise<ConstituencyDetailData | null> {
    try {
        const result = await api.get<ApiConstituencyDetail>(`/constituencies/${id}`, {
            cache: 'no-store',
        });
        return result;
    } catch {
        return getMockConstituencyDetail(id);
    }
}
