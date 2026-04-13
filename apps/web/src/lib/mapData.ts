import { IPartySummary, ConstituencyStatus } from '@election/shared';
import { MOCK_OVERVIEW } from '@/lib/mockData';

export type VoteType = 'constituency' | 'party_list' | 'referendum';

export interface MapRegion {
    id: number;
    nameTh: string;
    nameEn: string;
}

export interface MapProvince {
    id: number;
    regionId: number;
    nameTh: string;
    nameEn: string;
    code: string;
    x: number;
    y: number;
}

export interface MapCandidateResult {
    candidateId: number;
    candidateNumber: number;
    candidateName: string;
    partyId: number;
    partyName: string;
    partyColor: string;
    voteCount: number;
    votePct: number;
    isLeading: boolean;
    isWinner: boolean;
}

export interface MapConstituency {
    id: number;
    provinceId: number;
    regionId: number;
    provinceName: string;
    constituencyNumber: number;
    status: ConstituencyStatus;
    countingProgress: number;
    turnoutPct: number;
    eligibleVoters: number;
    totalVoters: number;
    leadingPartyId: number;
    leadingPartyName: string;
    leadingPartyColor: string;
    marginPct: number;
    isCloseRace: boolean;
    results: MapCandidateResult[];
}

export interface ConstituencyDetailData {
    id: number;
    constituencyNumber: number;
    status: ConstituencyStatus;
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

const REGIONS: MapRegion[] = [
    { id: 1, nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok' },
    { id: 2, nameTh: 'ภาคกลาง', nameEn: 'Central' },
    { id: 3, nameTh: 'ภาคเหนือ', nameEn: 'Northern' },
    { id: 4, nameTh: 'ภาคตะวันออกเฉียงเหนือ', nameEn: 'Northeastern' },
    { id: 5, nameTh: 'ภาคตะวันออก', nameEn: 'Eastern' },
    { id: 6, nameTh: 'ภาคตะวันตก', nameEn: 'Western' },
    { id: 7, nameTh: 'ภาคใต้', nameEn: 'Southern' },
];

const PROVINCES: MapProvince[] = [
    { id: 1, regionId: 1, nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok', code: 'BKK', x: 520, y: 300 },
    { id: 2, regionId: 2, nameTh: 'นนทบุรี', nameEn: 'Nonthaburi', code: 'NBI', x: 500, y: 278 },
    { id: 3, regionId: 2, nameTh: 'พระนครศรีอยุธยา', nameEn: 'Ayutthaya', code: 'AYA', x: 540, y: 260 },
    { id: 4, regionId: 2, nameTh: 'นครปฐม', nameEn: 'Nakhon Pathom', code: 'NPT', x: 482, y: 315 },
    { id: 5, regionId: 2, nameTh: 'ปทุมธานี', nameEn: 'Pathum Thani', code: 'PTE', x: 528, y: 282 },
    { id: 6, regionId: 3, nameTh: 'เชียงใหม่', nameEn: 'Chiang Mai', code: 'CMI', x: 405, y: 110 },
    { id: 7, regionId: 3, nameTh: 'เชียงราย', nameEn: 'Chiang Rai', code: 'CRI', x: 440, y: 80 },
    { id: 8, regionId: 3, nameTh: 'พิษณุโลก', nameEn: 'Phitsanulok', code: 'PLK', x: 470, y: 190 },
    { id: 9, regionId: 3, nameTh: 'ลำปาง', nameEn: 'Lampang', code: 'LPG', x: 422, y: 142 },
    { id: 10, regionId: 4, nameTh: 'ขอนแก่น', nameEn: 'Khon Kaen', code: 'KKN', x: 622, y: 180 },
    { id: 11, regionId: 4, nameTh: 'อุดรธานี', nameEn: 'Udon Thani', code: 'UDN', x: 650, y: 145 },
    { id: 12, regionId: 4, nameTh: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima', code: 'NMA', x: 612, y: 248 },
    { id: 13, regionId: 4, nameTh: 'อุบลราชธานี', nameEn: 'Ubon Ratchathani', code: 'UBN', x: 720, y: 230 },
    { id: 14, regionId: 5, nameTh: 'ชลบุรี', nameEn: 'Chon Buri', code: 'CBI', x: 590, y: 312 },
    { id: 15, regionId: 5, nameTh: 'ระยอง', nameEn: 'Rayong', code: 'RYG', x: 625, y: 332 },
    { id: 16, regionId: 5, nameTh: 'จันทบุรี', nameEn: 'Chanthaburi', code: 'CTI', x: 665, y: 350 },
    { id: 17, regionId: 6, nameTh: 'กาญจนบุรี', nameEn: 'Kanchanaburi', code: 'KRI', x: 445, y: 298 },
    { id: 18, regionId: 6, nameTh: 'ราชบุรี', nameEn: 'Ratchaburi', code: 'RBR', x: 462, y: 338 },
    { id: 19, regionId: 7, nameTh: 'สงขลา', nameEn: 'Songkhla', code: 'SKA', x: 565, y: 500 },
    { id: 20, regionId: 7, nameTh: 'นครศรีธรรมราช', nameEn: 'Nakhon Si Thammarat', code: 'NRT', x: 555, y: 458 },
    { id: 21, regionId: 7, nameTh: 'สุราษฎร์ธานี', nameEn: 'Surat Thani', code: 'SNI', x: 540, y: 420 },
    { id: 22, regionId: 7, nameTh: 'ภูเก็ต', nameEn: 'Phuket', code: 'PKT', x: 505, y: 438 },
];

const PARTIES = MOCK_OVERVIEW.parties;

export function getMapRegions(): MapRegion[] {
    return REGIONS;
}

export function getMapProvinces(): MapProvince[] {
    return PROVINCES;
}

export function generateMockConstituencies(total: number = 400): MapConstituency[] {
    const perProvinceCounter = new Map<number, number>();

    return Array.from({ length: total }, (_, index): MapConstituency => {
        const id = index + 1;
        const province = PROVINCES[index % PROVINCES.length];
        const constituencyNumber = (perProvinceCounter.get(province.id) ?? 0) + 1;
        perProvinceCounter.set(province.id, constituencyNumber);

        const partyA = PARTIES[(index * 7 + province.id) % PARTIES.length].party;
        const partyB = PARTIES[(index * 11 + province.id + 3) % PARTIES.length].party;
        const partyC = PARTIES[(index * 13 + province.id + 5) % PARTIES.length].party;

        const eligibleVoters = 115000 + ((id * 1379) % 62000);
        const turnoutPct = 57 + ((id * 17) % 290) / 10;
        const totalVoters = Math.round((eligibleVoters * turnoutPct) / 100);

        const marginPct = 1.4 + ((id * 9) % 150) / 10;
        const leaderShare = 41 + ((id * 7) % 170) / 10;
        const secondShare = Math.max(22, leaderShare - marginPct);
        const voteA = Math.round((totalVoters * leaderShare) / 100);
        const voteB = Math.round((totalVoters * secondShare) / 100);
        const voteC = Math.max(0, totalVoters - voteA - voteB);

        const countingProgress = 25 + ((id * 19) % 76);
        const status =
            countingProgress >= 98
                ? ConstituencyStatus.COMPLETED
                : countingProgress >= 50
                  ? ConstituencyStatus.COUNTING
                  : ConstituencyStatus.PENDING;

        const results: MapCandidateResult[] = [
            {
                candidateId: id * 10 + 1,
                candidateNumber: 1,
                candidateName: `ผู้สมัคร ${partyA.nameTh}`,
                partyId: partyA.id,
                partyName: partyA.nameTh,
                partyColor: partyA.color,
                voteCount: voteA,
                votePct: (voteA / totalVoters) * 100,
                isLeading: true,
                isWinner: status === ConstituencyStatus.COMPLETED,
            },
            {
                candidateId: id * 10 + 2,
                candidateNumber: 2,
                candidateName: `ผู้สมัคร ${partyB.nameTh}`,
                partyId: partyB.id,
                partyName: partyB.nameTh,
                partyColor: partyB.color,
                voteCount: voteB,
                votePct: (voteB / totalVoters) * 100,
                isLeading: false,
                isWinner: false,
            },
            {
                candidateId: id * 10 + 3,
                candidateNumber: 3,
                candidateName: `ผู้สมัคร ${partyC.nameTh}`,
                partyId: partyC.id,
                partyName: partyC.nameTh,
                partyColor: partyC.color,
                voteCount: voteC,
                votePct: (voteC / totalVoters) * 100,
                isLeading: false,
                isWinner: false,
            },
        ].sort((a, b) => b.voteCount - a.voteCount);

        return {
            id,
            provinceId: province.id,
            regionId: province.regionId,
            provinceName: province.nameTh,
            constituencyNumber,
            status,
            countingProgress,
            turnoutPct,
            eligibleVoters,
            totalVoters,
            leadingPartyId: results[0].partyId,
            leadingPartyName: results[0].partyName,
            leadingPartyColor: results[0].partyColor,
            marginPct,
            isCloseRace: marginPct <= 5,
            results,
        };
    });
}

export function getMockConstituencyDetail(id: number): ConstituencyDetailData | null {
    const constituency = generateMockConstituencies(400).find((item) => item.id === id);
    if (!constituency) {
        return null;
    }

    const province = PROVINCES.find((item) => item.id === constituency.provinceId);
    const region = REGIONS.find((item) => item.id === constituency.regionId);

    if (!province || !region) {
        return null;
    }

    return {
        id: constituency.id,
        constituencyNumber: constituency.constituencyNumber,
        status: constituency.status,
        countingProgress: constituency.countingProgress,
        eligibleVoters: constituency.eligibleVoters,
        totalVoters: constituency.totalVoters,
        goodBallots: Math.round(constituency.totalVoters * 0.97),
        badBallots: Math.round(constituency.totalVoters * 0.02),
        noVoteBallots: Math.round(constituency.totalVoters * 0.01),
        province: {
            id: province.id,
            nameTh: province.nameTh,
            nameEn: province.nameEn,
            code: province.code,
            region: {
                id: region.id,
                nameTh: region.nameTh,
                nameEn: region.nameEn,
            },
        },
        results: constituency.results.map((result) => ({
            candidateId: result.candidateId,
            partyId: result.partyId,
            voteCount: result.voteCount,
            isLeading: result.isLeading,
            isWinner: result.isWinner,
            candidate: {
                id: result.candidateId,
                candidateNumber: result.candidateNumber,
                nameTh: result.candidateName,
                nameEn: result.candidateName,
            },
            party: {
                id: result.partyId,
                nameTh: result.partyName,
                abbreviation: result.partyName.slice(0, 3),
                color: result.partyColor,
            },
        })),
    };
}

export function mapApiConstituenciesToMapData(
    apiData: Array<{
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
    }>,
    parties: IPartySummary[],
): MapConstituency[] {
    return apiData.map((item, index) => {
        const fallback = generateMockConstituencies(apiData.length)[index];
        const leader = parties[(index * 5 + item.id) % Math.max(1, parties.length)]?.party ?? fallback.results[0];
        const turnoutPct =
            item.eligibleVoters > 0
                ? Math.min(100, (item.totalVoters / item.eligibleVoters) * 100)
                : fallback.turnoutPct;

        return {
            ...fallback,
            id: item.id,
            provinceId: item.provinceId,
            provinceName: item.province.nameTh,
            regionId: item.province.regionId ?? fallback.regionId,
            constituencyNumber: item.constituencyNumber,
            status: item.status,
            countingProgress: item.countingProgress,
            eligibleVoters: item.eligibleVoters,
            totalVoters: item.totalVoters,
            turnoutPct,
            leadingPartyId: 'id' in leader ? leader.id : fallback.leadingPartyId,
            leadingPartyName: 'nameTh' in leader ? leader.nameTh : fallback.leadingPartyName,
            leadingPartyColor: 'color' in leader ? leader.color : fallback.leadingPartyColor,
        };
    });
}
