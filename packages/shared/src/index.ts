// ============================================
// Election Types
// ============================================

export enum ElectionType {
    GENERAL = 'GENERAL',
    BY_ELECTION = 'BY_ELECTION',
}

export enum ElectionStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    COUNTING = 'COUNTING',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export enum ConstituencyStatus {
    PENDING = 'PENDING',
    COUNTING = 'COUNTING',
    COMPLETED = 'COMPLETED',
}

export enum ReferendumStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    COUNTING = 'COUNTING',
    COMPLETED = 'COMPLETED',
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
}

// ============================================
// Election Interfaces
// ============================================

export interface IElection {
    id: number;
    name: string;
    electionDate: string;
    type: ElectionType;
    status: ElectionStatus;
    hasReferendum: boolean;
    totalEligibleVoters: number;
    createdAt: string;
    updatedAt: string;
}

export interface IRegion {
    id: number;
    nameTh: string;
    nameEn: string;
}

export interface IProvince {
    id: number;
    regionId: number;
    nameTh: string;
    nameEn: string;
    code: string;
}

export interface IParty {
    id: number;
    nameTh: string;
    nameEn: string;
    abbreviation: string;
    color: string;
    logoUrl: string | null;
    leaderName: string | null;
    leaderImageUrl: string | null;
    partyNumber: number;
}

export interface ICandidate {
    id: number;
    partyId: number;
    constituencyId: number;
    nameTh: string;
    nameEn: string;
    imageUrl: string | null;
    candidateNumber: number;
}

export interface IConstituency {
    id: number;
    electionId: number;
    provinceId: number;
    constituencyNumber: number;
    eligibleVoters: number;
    totalVoters: number;
    goodBallots: number;
    badBallots: number;
    noVoteBallots: number;
    countingProgress: number;
    status: ConstituencyStatus;
}

export interface IConstituencyResult {
    id: number;
    constituencyId: number;
    candidateId: number;
    partyId: number;
    voteCount: number;
    isLeading: boolean;
    isWinner: boolean;
    updatedAt: string;
}

export interface IPartyListCandidate {
    id: number;
    partyId: number;
    rank: number;
    nameTh: string;
    nameEn: string;
    imageUrl: string | null;
}

export interface IPartyListAllocation {
    id: number;
    electionId: number;
    partyId: number;
    totalPartyListVotes: number;
    allocatedSeats: number;
    constituencySeats: number;
    totalSeats: number;
}

export interface IReferendum {
    id: number;
    electionId: number;
    questionTh: string;
    questionEn: string;
    descriptionTh: string | null;
    descriptionEn: string | null;
    isEnabled: boolean;
    displayOrder: number;
    status: ReferendumStatus;
    totalEligibleVoters: number;
    totalVoters: number;
    approveCount: number;
    disapproveCount: number;
    abstainCount: number;
    badBallots: number;
    countingProgress: number;
    createdAt: string;
    updatedAt: string;
}

export interface IReferendumResult {
    id: number;
    referendumId: number;
    provinceId: number;
    approveCount: number;
    disapproveCount: number;
    abstainCount: number;
    totalVoters: number;
    countingProgress: number;
    updatedAt: string;
}

export interface IElectionSection {
    id: number;
    electionId: number;
    sectionKey: string;
    titleTh: string;
    titleEn: string;
    sectionType: string;
    isEnabled: boolean;
    displayOrder: number;
    config: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface IOverviewSummary {
    election: IElection;
    totalCounted: number;
    countingPercentage: number;
    parties: IPartySummary[];
    referendum: IReferendum[] | null;
    sections: IElectionSection[];
    lastUpdated: string;
}

export interface IPartySummary {
    party: IParty;
    constituencySeats: number;
    partyListSeats: number;
    totalSeats: number;
    totalVotes: number;
    rank: number;
}

// ============================================
// WebSocket Event Types
// ============================================

export interface WsVoteUpdated {
    constituencyId: number;
    results: IConstituencyResult[];
}

export interface WsPartyUpdated {
    partyId: number;
    totalSeats: number;
    constituencySeats: number;
    partyListSeats: number;
}

export interface WsReferendumUpdated {
    referendumId: number;
    approveCount: number;
    disapproveCount: number;
    abstainCount: number;
    countingProgress: number;
}

export interface WsReferendumToggled {
    referendumId: number;
    isEnabled: boolean;
}

export interface WsSectionToggled {
    sectionKey: string;
    isEnabled: boolean;
}

export interface WsCountingProgress {
    totalCounted: number;
    percentage: number;
}
