// ============================================
// Constants used across the Election system
// ============================================

/** Total constituency seats in Thai parliament */
export const TOTAL_CONSTITUENCY_SEATS = 400;

/** Total party-list seats in Thai parliament */
export const TOTAL_PARTY_LIST_SEATS = 100;

/** Total seats in Thai parliament */
export const TOTAL_SEATS = TOTAL_CONSTITUENCY_SEATS + TOTAL_PARTY_LIST_SEATS;

/** Minimum seats needed to form a government */
export const GOVERNMENT_FORMATION_THRESHOLD = 251;

/** Thai regions */
export const REGIONS = [
    { id: 1, nameTh: 'ภาคกลาง', nameEn: 'Central' },
    { id: 2, nameTh: 'ภาคเหนือ', nameEn: 'Northern' },
    { id: 3, nameTh: 'ภาคตะวันออกเฉียงเหนือ', nameEn: 'Northeastern' },
    { id: 4, nameTh: 'ภาคตะวันออก', nameEn: 'Eastern' },
    { id: 5, nameTh: 'ภาคตะวันตก', nameEn: 'Western' },
    { id: 6, nameTh: 'ภาคใต้', nameEn: 'Southern' },
    { id: 7, nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok' },
] as const;

/** Default election sections */
export const DEFAULT_SECTIONS = [
    { sectionKey: 'hero_banner', titleTh: 'แบนเนอร์หลัก', titleEn: 'Hero Banner', isEnabled: true, displayOrder: 1 },
    { sectionKey: 'top_parties', titleTh: 'พรรคอันดับต้น', titleEn: 'Top Parties', isEnabled: true, displayOrder: 2 },
    { sectionKey: 'referendum', titleTh: 'ผลประชามติ', titleEn: 'Referendum Results', isEnabled: false, displayOrder: 3 },
    { sectionKey: 'party_leaderboard', titleTh: 'ตารางอันดับพรรค', titleEn: 'Party Leaderboard', isEnabled: true, displayOrder: 4 },
    { sectionKey: 'counting_progress', titleTh: 'ความคืบหน้าการนับคะแนน', titleEn: 'Counting Progress', isEnabled: true, displayOrder: 5 },
    { sectionKey: 'map_view', titleTh: 'แผนที่ผลเลือกตั้ง', titleEn: 'Election Map', isEnabled: true, displayOrder: 6 },
    { sectionKey: 'coalition_simulator', titleTh: 'จำลองจัดตั้งรัฐบาล', titleEn: 'Coalition Simulator', isEnabled: true, displayOrder: 7 },
    { sectionKey: 'live_ticker', titleTh: 'ข่าวสารด่วน', titleEn: 'Live Ticker', isEnabled: true, displayOrder: 8 },
] as const;

/** WebSocket event names */
export const WS_EVENTS = {
    VOTE_UPDATED: 'vote:updated',
    PARTY_UPDATED: 'party:updated',
    REFERENDUM_UPDATED: 'referendum:updated',
    REFERENDUM_TOGGLED: 'referendum:toggled',
    SECTION_TOGGLED: 'section:toggled',
    COUNTING_PROGRESS: 'counting:progress',
    SUBSCRIBE_CONSTITUENCY: 'subscribe:constituency',
    SUBSCRIBE_PROVINCE: 'subscribe:province',
} as const;
