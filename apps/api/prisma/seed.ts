import { PrismaClient, ElectionType, ElectionStatus, ConstituencyStatus, ReferendumStatus, UserRole, Region, Province, Party, Constituency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// Thai Regions
// ============================================
const REGIONS = [
    { nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok' },
    { nameTh: 'ภาคกลาง', nameEn: 'Central' },
    { nameTh: 'ภาคเหนือ', nameEn: 'Northern' },
    { nameTh: 'ภาคตะวันออกเฉียงเหนือ', nameEn: 'Northeastern' },
    { nameTh: 'ภาคตะวันออก', nameEn: 'Eastern' },
    { nameTh: 'ภาคตะวันตก', nameEn: 'Western' },
    { nameTh: 'ภาคใต้', nameEn: 'Southern' },
];

// ============================================
// Thai 77 Provinces (grouped by region)
// ============================================
const PROVINCES: { nameTh: string; nameEn: string; code: string; regionIndex: number }[] = [
    // Bangkok (region 0)
    { nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok', code: 'BKK', regionIndex: 0 },

    // Central (region 1)
    { nameTh: 'กำแพงเพชร', nameEn: 'Kamphaeng Phet', code: 'KPT', regionIndex: 1 },
    { nameTh: 'ชัยนาท', nameEn: 'Chai Nat', code: 'CNT', regionIndex: 1 },
    { nameTh: 'นครนายก', nameEn: 'Nakhon Nayok', code: 'NYK', regionIndex: 1 },
    { nameTh: 'นครปฐม', nameEn: 'Nakhon Pathom', code: 'NPT', regionIndex: 1 },
    { nameTh: 'นครสวรรค์', nameEn: 'Nakhon Sawan', code: 'NSN', regionIndex: 1 },
    { nameTh: 'นนทบุรี', nameEn: 'Nonthaburi', code: 'NBI', regionIndex: 1 },
    { nameTh: 'ปทุมธานี', nameEn: 'Pathum Thani', code: 'PTE', regionIndex: 1 },
    { nameTh: 'พระนครศรีอยุธยา', nameEn: 'Phra Nakhon Si Ayutthaya', code: 'AYA', regionIndex: 1 },
    { nameTh: 'พิจิตร', nameEn: 'Phichit', code: 'PCT', regionIndex: 1 },
    { nameTh: 'พิษณุโลก', nameEn: 'Phitsanulok', code: 'PLK', regionIndex: 1 },
    { nameTh: 'เพชรบูรณ์', nameEn: 'Phetchabun', code: 'PNB', regionIndex: 1 },
    { nameTh: 'ลพบุรี', nameEn: 'Lop Buri', code: 'LRI', regionIndex: 1 },
    { nameTh: 'สมุทรปราการ', nameEn: 'Samut Prakan', code: 'SPK', regionIndex: 1 },
    { nameTh: 'สมุทรสงคราม', nameEn: 'Samut Songkhram', code: 'SKM', regionIndex: 1 },
    { nameTh: 'สมุทรสาคร', nameEn: 'Samut Sakhon', code: 'SKN', regionIndex: 1 },
    { nameTh: 'สระบุรี', nameEn: 'Saraburi', code: 'SRI', regionIndex: 1 },
    { nameTh: 'สิงห์บุรี', nameEn: 'Sing Buri', code: 'SBR', regionIndex: 1 },
    { nameTh: 'สุโขทัย', nameEn: 'Sukhothai', code: 'STI', regionIndex: 1 },
    { nameTh: 'สุพรรณบุรี', nameEn: 'Suphan Buri', code: 'SPB', regionIndex: 1 },
    { nameTh: 'อ่างทอง', nameEn: 'Ang Thong', code: 'ATG', regionIndex: 1 },
    { nameTh: 'อุทัยธานี', nameEn: 'Uthai Thani', code: 'UTI', regionIndex: 1 },

    // Northern (region 2)
    { nameTh: 'เชียงราย', nameEn: 'Chiang Rai', code: 'CRI', regionIndex: 2 },
    { nameTh: 'เชียงใหม่', nameEn: 'Chiang Mai', code: 'CMI', regionIndex: 2 },
    { nameTh: 'น่าน', nameEn: 'Nan', code: 'NAN', regionIndex: 2 },
    { nameTh: 'พะเยา', nameEn: 'Phayao', code: 'PYO', regionIndex: 2 },
    { nameTh: 'แพร่', nameEn: 'Phrae', code: 'PRE', regionIndex: 2 },
    { nameTh: 'แม่ฮ่องสอน', nameEn: 'Mae Hong Son', code: 'MSN', regionIndex: 2 },
    { nameTh: 'ลำปาง', nameEn: 'Lampang', code: 'LPG', regionIndex: 2 },
    { nameTh: 'ลำพูน', nameEn: 'Lamphun', code: 'LPN', regionIndex: 2 },
    { nameTh: 'อุตรดิตถ์', nameEn: 'Uttaradit', code: 'UTD', regionIndex: 2 },

    // Northeastern (region 3)
    { nameTh: 'กาฬสินธุ์', nameEn: 'Kalasin', code: 'KSN', regionIndex: 3 },
    { nameTh: 'ขอนแก่น', nameEn: 'Khon Kaen', code: 'KKN', regionIndex: 3 },
    { nameTh: 'ชัยภูมิ', nameEn: 'Chaiyaphum', code: 'CPM', regionIndex: 3 },
    { nameTh: 'นครพนม', nameEn: 'Nakhon Phanom', code: 'NPM', regionIndex: 3 },
    { nameTh: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima', code: 'NMA', regionIndex: 3 },
    { nameTh: 'บึงกาฬ', nameEn: 'Bueng Kan', code: 'BKN', regionIndex: 3 },
    { nameTh: 'บุรีรัมย์', nameEn: 'Buri Ram', code: 'BRM', regionIndex: 3 },
    { nameTh: 'มหาสารคาม', nameEn: 'Maha Sarakham', code: 'MKM', regionIndex: 3 },
    { nameTh: 'มุกดาหาร', nameEn: 'Mukdahan', code: 'MDH', regionIndex: 3 },
    { nameTh: 'ยโสธร', nameEn: 'Yasothon', code: 'YST', regionIndex: 3 },
    { nameTh: 'ร้อยเอ็ด', nameEn: 'Roi Et', code: 'RET', regionIndex: 3 },
    { nameTh: 'เลย', nameEn: 'Loei', code: 'LEI', regionIndex: 3 },
    { nameTh: 'ศรีสะเกษ', nameEn: 'Si Sa Ket', code: 'SSK', regionIndex: 3 },
    { nameTh: 'สกลนคร', nameEn: 'Sakon Nakhon', code: 'SNK', regionIndex: 3 },
    { nameTh: 'สุรินทร์', nameEn: 'Surin', code: 'SRN', regionIndex: 3 },
    { nameTh: 'หนองคาย', nameEn: 'Nong Khai', code: 'NKI', regionIndex: 3 },
    { nameTh: 'หนองบัวลำภู', nameEn: 'Nong Bua Lam Phu', code: 'NBP', regionIndex: 3 },
    { nameTh: 'อำนาจเจริญ', nameEn: 'Amnat Charoen', code: 'ACR', regionIndex: 3 },
    { nameTh: 'อุดรธานี', nameEn: 'Udon Thani', code: 'UDN', regionIndex: 3 },
    { nameTh: 'อุบลราชธานี', nameEn: 'Ubon Ratchathani', code: 'UBN', regionIndex: 3 },

    // Eastern (region 4)
    { nameTh: 'จันทบุรี', nameEn: 'Chanthaburi', code: 'CTI', regionIndex: 4 },
    { nameTh: 'ฉะเชิงเทรา', nameEn: 'Chachoengsao', code: 'CCO', regionIndex: 4 },
    { nameTh: 'ชลบุรี', nameEn: 'Chon Buri', code: 'CBI', regionIndex: 4 },
    { nameTh: 'ตราด', nameEn: 'Trat', code: 'TRT', regionIndex: 4 },
    { nameTh: 'ปราจีนบุรี', nameEn: 'Prachin Buri', code: 'PRI', regionIndex: 4 },
    { nameTh: 'ระยอง', nameEn: 'Rayong', code: 'RYG', regionIndex: 4 },
    { nameTh: 'สระแก้ว', nameEn: 'Sa Kaeo', code: 'SKW', regionIndex: 4 },

    // Western (region 5)
    { nameTh: 'กาญจนบุรี', nameEn: 'Kanchanaburi', code: 'KRI', regionIndex: 5 },
    { nameTh: 'ตาก', nameEn: 'Tak', code: 'TAK', regionIndex: 5 },
    { nameTh: 'ประจวบคีรีขันธ์', nameEn: 'Prachuap Khiri Khan', code: 'PKN', regionIndex: 5 },
    { nameTh: 'เพชรบุรี', nameEn: 'Phetchaburi', code: 'PBI', regionIndex: 5 },
    { nameTh: 'ราชบุรี', nameEn: 'Ratchaburi', code: 'RBR', regionIndex: 5 },

    // Southern (region 6)
    { nameTh: 'กระบี่', nameEn: 'Krabi', code: 'KBI', regionIndex: 6 },
    { nameTh: 'ชุมพร', nameEn: 'Chumphon', code: 'CPN', regionIndex: 6 },
    { nameTh: 'ตรัง', nameEn: 'Trang', code: 'TRG', regionIndex: 6 },
    { nameTh: 'นครศรีธรรมราช', nameEn: 'Nakhon Si Thammarat', code: 'NRT', regionIndex: 6 },
    { nameTh: 'นราธิวาส', nameEn: 'Narathiwat', code: 'NWT', regionIndex: 6 },
    { nameTh: 'ปัตตานี', nameEn: 'Pattani', code: 'PTN', regionIndex: 6 },
    { nameTh: 'พังงา', nameEn: 'Phang Nga', code: 'PNA', regionIndex: 6 },
    { nameTh: 'พัทลุง', nameEn: 'Phatthalung', code: 'PLG', regionIndex: 6 },
    { nameTh: 'ภูเก็ต', nameEn: 'Phuket', code: 'PKT', regionIndex: 6 },
    { nameTh: 'ยะลา', nameEn: 'Yala', code: 'YLA', regionIndex: 6 },
    { nameTh: 'ระนอง', nameEn: 'Ranong', code: 'RNG', regionIndex: 6 },
    { nameTh: 'สตูล', nameEn: 'Satun', code: 'STN', regionIndex: 6 },
    { nameTh: 'สงขลา', nameEn: 'Songkhla', code: 'SKA', regionIndex: 6 },
    { nameTh: 'สุราษฎร์ธานี', nameEn: 'Surat Thani', code: 'SNI', regionIndex: 6 },
];

// ============================================
// Sample Political Parties
// ============================================
const PARTIES = [
    { nameTh: 'พรรคเพื่อไทย', nameEn: 'Pheu Thai Party', abbreviation: 'PTP', color: '#E2211C', partyNumber: 1 },
    { nameTh: 'พรรคก้าวไกล', nameEn: 'Move Forward Party', abbreviation: 'MFP', color: '#F96E2A', partyNumber: 2 },
    { nameTh: 'พรรคภูมิใจไทย', nameEn: 'Bhumjaithai Party', abbreviation: 'BJT', color: '#004FA3', partyNumber: 3 },
    { nameTh: 'พรรคพลังประชารัฐ', nameEn: 'Palang Pracharath Party', abbreviation: 'PPRP', color: '#1E3A5F', partyNumber: 4 },
    { nameTh: 'พรรครวมไทยสร้างชาติ', nameEn: 'United Thai Nation Party', abbreviation: 'UTN', color: '#2B388F', partyNumber: 5 },
    { nameTh: 'พรรคประชาธิปัตย์', nameEn: 'Democrat Party', abbreviation: 'DP', color: '#1B75BB', partyNumber: 6 },
    { nameTh: 'พรรคชาติไทยพัฒนา', nameEn: 'Chart Thai Pattana Party', abbreviation: 'CTP', color: '#3F9B3D', partyNumber: 7 },
    { nameTh: 'พรรคประชาชาติ', nameEn: 'Prachachat Party', abbreviation: 'PCC', color: '#1D6D37', partyNumber: 8 },
    { nameTh: 'พรรคไทยสร้างไทย', nameEn: 'Thai Sang Thai Party', abbreviation: 'TST', color: '#ED1C24', partyNumber: 9 },
    { nameTh: 'พรรคเสรีรวมไทย', nameEn: 'Seri Ruam Thai Party', abbreviation: 'SRT', color: '#FFC107', partyNumber: 10 },
];

// ============================================
// Default Election Sections
// ============================================
const DEFAULT_SECTIONS = [
    { sectionKey: 'hero_banner', titleTh: 'แบนเนอร์หลัก', titleEn: 'Hero Banner', isEnabled: true, displayOrder: 1 },
    { sectionKey: 'top_parties', titleTh: 'พรรคอันดับต้น', titleEn: 'Top Parties', isEnabled: true, displayOrder: 2 },
    { sectionKey: 'referendum', titleTh: 'ผลประชามติ', titleEn: 'Referendum Results', isEnabled: true, displayOrder: 3 },
    { sectionKey: 'party_leaderboard', titleTh: 'ตารางอันดับพรรค', titleEn: 'Party Leaderboard', isEnabled: true, displayOrder: 4 },
    { sectionKey: 'counting_progress', titleTh: 'ความคืบหน้าการนับคะแนน', titleEn: 'Counting Progress', isEnabled: true, displayOrder: 5 },
    { sectionKey: 'map_view', titleTh: 'แผนที่ผลเลือกตั้ง', titleEn: 'Election Map', isEnabled: true, displayOrder: 6 },
    { sectionKey: 'coalition_simulator', titleTh: 'จำลองจัดตั้งรัฐบาล', titleEn: 'Coalition Simulator', isEnabled: true, displayOrder: 7 },
    { sectionKey: 'live_ticker', titleTh: 'ข่าวสารด่วน', titleEn: 'Live Ticker', isEnabled: true, displayOrder: 8 },
];

// Bangkok constituency count
const BANGKOK_CONSTITUENCY_COUNT = 33;

// ============================================
// Sample candidate names per party
// ============================================
const SAMPLE_CANDIDATES: Record<number, { nameTh: string; nameEn: string }[]> = {
    0: [ // Pheu Thai
        { nameTh: 'สมชาย รักชาติ', nameEn: 'Somchai Rakchat' },
        { nameTh: 'วิชัย ใจดี', nameEn: 'Wichai Jaidee' },
        { nameTh: 'นภา สว่างอารมณ์', nameEn: 'Napha Sawangarom' },
    ],
    1: [ // Move Forward
        { nameTh: 'ธนกร อนาคต', nameEn: 'Thanakorn Anakhot' },
        { nameTh: 'ปิยะ ก้าวหน้า', nameEn: 'Piya Kaona' },
        { nameTh: 'สุดา เปลี่ยนแปลง', nameEn: 'Suda Plianplaeng' },
    ],
    2: [ // Bhumjaithai
        { nameTh: 'ประเสริฐ ภูมิใจ', nameEn: 'Prasert Phumjai' },
        { nameTh: 'อรุณ ดิน', nameEn: 'Arun Din' },
    ],
    3: [ // PPRP
        { nameTh: 'พลศักดิ์ แข็งแรง', nameEn: 'Phonlasak Khaengraeng' },
        { nameTh: 'มานะ อดทน', nameEn: 'Mana Otthon' },
    ],
    4: [ // UTN
        { nameTh: 'สุรชัย สร้างชาติ', nameEn: 'Surachai Sangchat' },
        { nameTh: 'อนันต์ รวมไทย', nameEn: 'Anan Ruamthai' },
    ],
    5: [ // Democrat
        { nameTh: 'อภิสิทธิ์ ประชาธิปไตย', nameEn: 'Abhisit Prachathipatai' },
        { nameTh: 'กานดา เสรีภาพ', nameEn: 'Kanda Seriphap' },
    ],
};

async function main() {
    console.log('🌱 Starting seed...');

    // ========================================
    // 1. Create Regions
    // ========================================
    console.log('📍 Creating regions...');
    const regionRecords: Region[] = [];
    for (const region of REGIONS) {
        const r: Region = await prisma.region.upsert({
            where: { id: regionRecords.length + 1 },
            update: {},
            create: region,
        });
        regionRecords.push(r);
    }
    console.log(`   ✅ ${regionRecords.length} regions created`);

    // ========================================
    // 2. Create Provinces
    // ========================================
    console.log('🏛️  Creating provinces...');
    const provinceRecords: Province[] = [];
    for (const prov of PROVINCES) {
        const p: Province = await prisma.province.upsert({
            where: { code: prov.code },
            update: {},
            create: {
                nameTh: prov.nameTh,
                nameEn: prov.nameEn,
                code: prov.code,
                regionId: regionRecords[prov.regionIndex].id,
            },
        });
        provinceRecords.push(p);
    }
    console.log(`   ✅ ${provinceRecords.length} provinces created`);

    // ========================================
    // 3. Create Parties
    // ========================================
    console.log('🎉 Creating parties...');
    const partyRecords: Party[] = [];
    for (const party of PARTIES) {
        const p: Party = await prisma.party.upsert({
            where: { id: partyRecords.length + 1 },
            update: {},
            create: party,
        });
        partyRecords.push(p);
    }
    console.log(`   ✅ ${partyRecords.length} parties created`);

    // ========================================
    // 4. Create Sample Election
    // ========================================
    console.log('🗳️  Creating sample election...');
    const election = await prisma.election.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'การเลือกตั้งสมาชิกสภาผู้แทนราษฎร 2569',
            electionDate: new Date('2026-07-01'),
            type: ElectionType.GENERAL,
            status: ElectionStatus.DRAFT,
            hasReferendum: true,
            totalEligibleVoters: 52000000,
        },
    });
    console.log(`   ✅ Election "${election.name}" created`);

    // ========================================
    // 5. Create Election Sections
    // ========================================
    console.log('📑 Creating election sections...');
    for (const section of DEFAULT_SECTIONS) {
        await prisma.electionSection.upsert({
            where: {
                electionId_sectionKey: {
                    electionId: election.id,
                    sectionKey: section.sectionKey,
                },
            },
            update: {},
            create: {
                electionId: election.id,
                ...section,
            },
        });
    }
    console.log(`   ✅ ${DEFAULT_SECTIONS.length} sections created`);

    // ========================================
    // 6. Create Bangkok Constituencies
    // ========================================
    console.log('🏘️  Creating Bangkok constituencies...');
    const bangkok = provinceRecords.find(p => p.code === 'BKK')!;
    const constituencyRecords = [];

    for (let i = 1; i <= BANGKOK_CONSTITUENCY_COUNT; i++) {
        const c = await prisma.constituency.upsert({
            where: {
                electionId_provinceId_constituencyNumber: {
                    electionId: election.id,
                    provinceId: bangkok.id,
                    constituencyNumber: i,
                },
            },
            update: {},
            create: {
                electionId: election.id,
                provinceId: bangkok.id,
                constituencyNumber: i,
                eligibleVoters: 100000 + Math.floor(Math.random() * 50000),
                status: ConstituencyStatus.PENDING,
            },
        });
        constituencyRecords.push(c);
    }
    console.log(`   ✅ ${constituencyRecords.length} Bangkok constituencies created`);

    // ========================================
    // 7. Create Sample Candidates for Bangkok
    // ========================================
    console.log('👤 Creating sample candidates...');
    let candidateCount = 0;

    for (const constituency of constituencyRecords) {
        // Each constituency gets candidates from the first 6 parties
        const partiesToUse = Math.min(6, partyRecords.length);
        for (let pi = 0; pi < partiesToUse; pi++) {
            const party = partyRecords[pi];
            const candidatePool = SAMPLE_CANDIDATES[pi] || SAMPLE_CANDIDATES[0];
            const candidateName = candidatePool[(constituency.constituencyNumber - 1) % candidatePool.length];

            await prisma.candidate.create({
                data: {
                    partyId: party.id,
                    constituencyId: constituency.id,
                    nameTh: candidateName.nameTh,
                    nameEn: candidateName.nameEn,
                    candidateNumber: pi + 1,
                },
            });
            candidateCount++;
        }
    }
    console.log(`   ✅ ${candidateCount} candidates created`);

    // ========================================
    // 8. Create Party List Candidates (top 10 per party)
    // ========================================
    console.log('📋 Creating party list candidates...');
    let partyListCount = 0;
    const partyListNames = [
        'คนที่ 1', 'คนที่ 2', 'คนที่ 3', 'คนที่ 4', 'คนที่ 5',
        'คนที่ 6', 'คนที่ 7', 'คนที่ 8', 'คนที่ 9', 'คนที่ 10',
    ];

    for (const party of partyRecords) {
        for (let rank = 1; rank <= 10; rank++) {
            await prisma.partyListCandidate.upsert({
                where: {
                    partyId_rank: {
                        partyId: party.id,
                        rank,
                    },
                },
                update: {},
                create: {
                    partyId: party.id,
                    rank,
                    nameTh: `${party.nameTh} ${partyListNames[rank - 1]}`,
                    nameEn: `${party.nameEn} Candidate ${rank}`,
                },
            });
            partyListCount++;
        }
    }
    console.log(`   ✅ ${partyListCount} party list candidates created`);

    // ========================================
    // 9. Create Party List Allocations (initial zeros)
    // ========================================
    console.log('📊 Creating party list allocations...');
    for (const party of partyRecords) {
        await prisma.partyListAllocation.upsert({
            where: {
                electionId_partyId: {
                    electionId: election.id,
                    partyId: party.id,
                },
            },
            update: {},
            create: {
                electionId: election.id,
                partyId: party.id,
                totalPartyListVotes: 0,
                allocatedSeats: 0,
                constituencySeats: 0,
                totalSeats: 0,
            },
        });
    }
    console.log(`   ✅ ${partyRecords.length} party list allocations created`);

    // ========================================
    // 10. Create Sample Referendum
    // ========================================
    console.log('🗳️  Creating sample referendum...');
    const referendum = await prisma.referendum.upsert({
        where: { id: 1 },
        update: {},
        create: {
            electionId: election.id,
            questionTh: 'ท่านเห็นชอบหรือไม่ที่จะให้มีการจัดทำรัฐธรรมนูญฉบับใหม่ โดยไม่แก้ไขหมวด 1 และหมวด 2',
            questionEn: 'Do you approve of drafting a new constitution without amending Chapter 1 and Chapter 2?',
            descriptionTh: 'ประชามติเกี่ยวกับการจัดทำรัฐธรรมนูญฉบับใหม่ทั้งฉบับ โดยคงไว้ซึ่งหมวด 1 บททั่วไป และหมวด 2 พระมหากษัตริย์',
            descriptionEn: 'Referendum on drafting an entirely new constitution while preserving Chapter 1 (General) and Chapter 2 (The King)',
            isEnabled: true,
            displayOrder: 1,
            status: ReferendumStatus.DRAFT,
            totalEligibleVoters: 52000000,
        },
    });
    console.log(`   ✅ Referendum created: "${referendum.questionTh.substring(0, 50)}..."`);

    // ========================================
    // 11. Create Admin User
    // ========================================
    console.log('👑 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: hashedPassword,
            displayName: 'Super Admin',
            role: UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });
    console.log('   ✅ Admin user created (username: admin, password: admin123)');

    // ========================================
    // Summary
    // ========================================
    const counts = {
        regions: await prisma.region.count(),
        provinces: await prisma.province.count(),
        parties: await prisma.party.count(),
        elections: await prisma.election.count(),
        sections: await prisma.electionSection.count(),
        constituencies: await prisma.constituency.count(),
        candidates: await prisma.candidate.count(),
        partyListCandidates: await prisma.partyListCandidate.count(),
        partyListAllocations: await prisma.partyListAllocation.count(),
        referendums: await prisma.referendum.count(),
        users: await prisma.user.count(),
    };

    console.log('\n🎉 Seed completed! Summary:');
    console.log('───────────────────────────');
    Object.entries(counts).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
