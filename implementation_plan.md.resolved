# ระบบรายงานผลการเลือกตั้งประเทศไทย (Thai Election Reporting System)

ระบบรายงานผลการเลือกตั้งแบบเรียลไทม์ พร้อมระบบ CMS หลังบ้าน สร้างขึ้นโดยอ้างอิงจาก THE STANDARD Election 2569, Workpoint Vote66 และ Vote62 พร้อมการปรับปรุงด้าน UX, Performance และ Feature ที่ดีขึ้น

## User Review Required

> [!IMPORTANT]
> **เลือก Tech Stack**: แผนนี้ใช้ **Next.js 15 (App Router)** + **NestJS** + **PostgreSQL** + **Redis** + **Socket.IO** ซึ่งผู้ใช้มีประสบการณ์จากโปรเจคก่อนหน้า หากต้องการเปลี่ยน stack กรุณาแจ้ง

> [!WARNING]
> **ข้อมูลจาก กกต.**: ระบบนี้ออกแบบให้รองรับทั้งการกรอกข้อมูลด้วยมือผ่าน CMS และการ integrate กับ API ของ กกต. (ถ้ามี) ต้องตัดสินใจเรื่องแหล่งข้อมูลหลัก

> [!CAUTION]
> **ระบบรองรับผู้ใช้จำนวนมาก**: ต้อง deploy ด้วย CDN + Edge Caching + Redis pub/sub ควรวางแผนเรื่อง infrastructure ตั้งแต่ต้น

---

## สถาปัตยกรรมระบบ (System Architecture)

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["Next.js Frontend<br/>(SSG + ISR + CSR)"]
        ADMIN["Admin CMS Panel"]
    end
    
    subgraph "CDN & Edge"
        CDN["Cloudflare CDN<br/>Static Assets + API Cache"]
        EDGE["Edge Functions<br/>(ISR Revalidation)"]
    end
    
    subgraph "API Layer"
        API["NestJS API Server<br/>(REST + WebSocket)"]
        WS["Socket.IO Gateway<br/>(Real-time Events)"]
    end
    
    subgraph "Data Layer"
        PG["PostgreSQL<br/>(Primary DB)"]
        REDIS["Redis<br/>(Cache + Pub/Sub)"]
        S3["S3/R2 Storage<br/>(Images & Assets)"]
    end
    
    subgraph "Data Input"
        CMS["CMS Editor<br/>(Manual Input)"]
        ECT["กกต. API<br/>(Auto Sync)"]
        CROWD["Volunteer Upload<br/>(Vote62-style)"]
    end
    
    WEB --> CDN --> API
    ADMIN --> API
    API --> WS
    API --> PG
    API --> REDIS
    API --> S3
    CMS --> API
    ECT --> API
    CROWD --> API
    WS --> REDIS
```

---

## Proposed Changes

### Phase 1: Project Setup & Monorepo Foundation

สร้างโครงสร้างโปรเจค Turborepo monorepo

#### [NEW] [package.json](file:///d:/Projects/election/package.json)
- Root monorepo config with Turborepo

#### [NEW] [turbo.json](file:///d:/Projects/election/turbo.json)
- Build pipeline config

#### [NEW] Frontend App — `apps/web/`
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Socket.IO client
- Recharts / Nivo (charts & visualizations)
- D3.js + Thailand GeoJSON (interactive map)

#### [NEW] Backend API — `apps/api/`
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Redis (ioredis)
- Socket.IO server
- Bull (background job queue)
- JWT authentication
- Rate limiting & throttling

#### [NEW] Shared Package — `packages/shared/`
- Shared types, constants, utilities
- Election data interfaces

**โครงสร้าง Folder:**
```
election/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (public)/       # Public pages
│   │   │   │   ├── page.tsx              # หน้าภาพรวม (Overview)
│   │   │   │   ├── map/page.tsx          # หน้าแผนที่ (Map)
│   │   │   │   ├── party/[id]/page.tsx   # หน้ารายละเอียดพรรค
│   │   │   │   ├── constituency/[id]/    # หน้ารายละเอียดเขต
│   │   │   │   ├── candidate/[id]/       # หน้ารายละเอียดผู้สมัคร
│   │   │   │   ├── coalition/page.tsx    # จำลองจัดตั้งรัฐบาล
│   │   │   │   └── referendum/page.tsx   # ผลประชามติ
│   │   │   ├── admin/          # Admin CMS
│   │   │   │   ├── dashboard/
│   │   │   │   ├── parties/
│   │   │   │   ├── candidates/
│   │   │   │   ├── constituencies/
│   │   │   │   ├── votes/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── charts/         # Chart components
│   │   │   ├── map/            # Thailand map components
│   │   │   ├── party/          # Party-related components
│   │   │   ├── candidate/      # Candidate components
│   │   │   ├── realtime/       # Real-time status indicators
│   │   │   └── layout/         # Layout components
│   │   └── lib/
│   │       ├── api/            # API clients
│   │       ├── hooks/          # Custom hooks
│   │       ├── socket/         # Socket.IO setup
│   │       └── utils/          # Utilities
│   └── api/                    # NestJS Backend
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── party/
│           │   ├── candidate/
│           │   ├── constituency/
│           │   ├── vote/
│           │   ├── referendum/
│           │   ├── media/
│           │   └── settings/
│           ├── gateways/       # WebSocket gateways
│           ├── jobs/           # Background jobs
│           └── common/
├── packages/
│   └── shared/
│       ├── types/
│       └── constants/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── docker-compose.yml
```

---

### Phase 2: Database Design

ออกแบบฐานข้อมูลให้รองรับโครงสร้างการเลือกตั้งไทย

#### [NEW] [schema.prisma](file:///d:/Projects/election/prisma/schema.prisma)

**ER Diagram:**
```mermaid
erDiagram
    Election ||--o{ Constituency : has
    Election ||--o{ PartyListAllocation : has
    Election ||--o{ Referendum : "may have (0..N)"
    Election ||--o{ ElectionSection : "has configurable sections"
    
    Party ||--o{ Candidate : has
    Party ||--o{ PartyListCandidate : has
    Party ||--o{ PartyListAllocation : has
    
    Province ||--o{ Constituency : has
    Region ||--o{ Province : has
    
    Constituency ||--o{ Candidate : "runs in"
    Constituency ||--o{ ConstituencyResult : has
    
    Candidate ||--o{ ConstituencyResult : receives
    
    PartyListCandidate }o--|| Party : "belongs to"
    
    Referendum ||--o{ ReferendumResult : has
    ReferendumResult }o--|| Province : "per province"
    
    User ||--o{ AuditLog : creates
    
    Election {
        int id PK
        string name
        date electionDate
        enum type
        enum status
        boolean hasReferendum
        int totalEligibleVoters
        datetime createdAt
    }
    
    ElectionSection {
        int id PK
        int electionId FK
        string sectionKey
        string titleTh
        string titleEn
        enum sectionType
        boolean isEnabled
        int displayOrder
        json config
        datetime createdAt
        datetime updatedAt
    }
    
    Region {
        int id PK
        string nameTh
        string nameEn
    }
    
    Province {
        int id PK
        int regionId FK
        string nameTh
        string nameEn
        string code
    }
    
    Party {
        int id PK
        string nameTh
        string nameEn
        string abbreviation
        string color
        string logoUrl
        string leaderName
        string leaderImageUrl
        int partyNumber
    }
    
    Constituency {
        int id PK
        int electionId FK
        int provinceId FK
        int constituencyNumber
        int eligibleVoters
        int totalVoters
        int goodBallots
        int badBallots
        int noVoteBallots
        float countingProgress
        enum status
    }
    
    Candidate {
        int id PK
        int partyId FK
        int constituencyId FK
        string nameTh
        string nameEn
        string imageUrl
        int candidateNumber
    }
    
    ConstituencyResult {
        int id PK
        int constituencyId FK
        int candidateId FK
        int partyId FK
        int voteCount
        boolean isLeading
        boolean isWinner
        datetime updatedAt
    }
    
    PartyListCandidate {
        int id PK
        int partyId FK
        int rank
        string nameTh
        string nameEn
        string imageUrl
    }
    
    PartyListAllocation {
        int id PK
        int electionId FK
        int partyId FK
        int totalPartyListVotes
        int allocatedSeats
        int constituencySeats
        int totalSeats
    }
    
    Referendum {
        int id PK
        int electionId FK
        string questionTh
        string questionEn
        string descriptionTh
        string descriptionEn
        boolean isEnabled
        int displayOrder
        enum status
        int totalEligibleVoters
        int totalVoters
        int approveCount
        int disapproveCount
        int abstainCount
        int badBallots
        float countingProgress
        datetime createdAt
        datetime updatedAt
    }
    
    ReferendumResult {
        int id PK
        int referendumId FK
        int provinceId FK
        int approveCount
        int disapproveCount
        int abstainCount
        int totalVoters
        float countingProgress
        datetime updatedAt
    }
    
    User {
        int id PK
        string username
        string passwordHash
        enum role
        datetime createdAt
    }
    
    AuditLog {
        int id PK
        int userId FK
        string action
        string entity
        int entityId
        json oldData
        json newData
        datetime createdAt
    }
```

**Key Tables:**
| Table | Purpose |
|-------|---------|
| `Election` | ข้อมูลการเลือกตั้ง + flag `hasReferendum` |
| `ElectionSection` | **ใหม่** — กำหนด section ที่แสดงบนหน้าบ้าน (เปิด/ปิดได้) |
| `Region` | ภูมิภาค (ภาคกลาง, เหนือ, อีสาน, ฯลฯ) |
| `Province` | จังหวัด 77 จังหวัด |
| `Party` | พรรคการเมือง พร้อมสี, โลโก้, หัวหน้าพรรค |
| `Constituency` | เขตเลือกตั้ง 400 เขต |
| `Candidate` | ผู้สมัคร สส.เขต |
| `ConstituencyResult` | ผลคะแนนรายเขต (real-time update) |
| `PartyListCandidate` | ผู้สมัคร สส.บัญชีรายชื่อ |
| `PartyListAllocation` | จำนวนที่นั่งบัญชีรายชื่อที่คำนวณได้ |
| `Referendum` | **ปรับปรุง** — ผลประชามติ (สร้าง/แก้ไข/เปิด/ปิดได้จาก CMS) |
| `ReferendumResult` | **ใหม่** — ผลประชามติรายจังหวัด |
| `User` | ผู้ดูแลระบบ |
| `AuditLog` | บันทึกการแก้ไขข้อมูล |

> [!NOTE]
> **Referendum เป็น Dynamic Content** — Admin สามารถ:
> - สร้างคำถามประชามติใหม่ได้ไม่จำกัด (อาจมีมากกว่า 1 คำถามต่อการเลือกตั้ง)
> - เปิด/ปิดการแสดงผลประชามติบนหน้าบ้านได้
> - กำหนดลำดับการแสดงผล (`displayOrder`)
> - ถ้าการเลือกตั้งครั้งนั้นไม่มีประชามติ → ตั้ง `hasReferendum = false` → หน้าบ้านจะไม่แสดง section ประชามติเลย
> - แก้ไขคำถาม, คำอธิบาย, และสถานะได้ตลอดเวลา

#### ElectionSection — ระบบ Dynamic Content Blocks

นอกจากประชามติ ระบบยังรองรับ **Content Blocks ที่สามารถเปิด/ปิดได้จาก CMS** สำหรับส่วนอื่นๆ ของหน้าบ้าน:

| Section Key | Default | Description |
|-------------|---------|-------------|
| `hero_banner` | ✅ เปิด | Banner หลักแสดงผลรวม |
| `top_parties` | ✅ เปิด | TOP 3 พรรคพร้อมรูปหัวหน้าพรรค |
| `party_leaderboard` | ✅ เปิด | ตารางอันดับพรรคทั้งหมด |
| `referendum` | ⚙️ ขึ้นกับ election | ผลประชามติ (เปิด/ปิดตาม `hasReferendum`) |
| `map_view` | ✅ เปิด | แผนที่แสดงผลรายเขต |
| `coalition_simulator` | ✅ เปิด | จำลองจัดตั้งรัฐบาล |
| `live_ticker` | ✅ เปิด | แถบข่าวสารด่วน |
| `counting_progress` | ✅ เปิด | ความคืบหน้าการนับคะแนน |

---

### Phase 3: Backend API & Real-time Infrastructure

#### [NEW] NestJS Modules — `apps/api/src/modules/`

**REST API Endpoints:**

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `auth` | POST `/auth/login`, POST `/auth/refresh` | JWT Authentication |
| `party` | GET/POST/PUT/DELETE `/parties` | CRUD พรรคการเมือง |
| `candidate` | GET/POST/PUT/DELETE `/candidates` | CRUD ผู้สมัคร |
| `constituency` | GET/POST/PUT `/constituencies` | CRUD เขตเลือกตั้ง |
| `vote` | GET/POST/PUT `/votes` | บันทึก/อัปเดตผลคะแนน |
| `referendum` | GET/POST/PUT/DELETE `/referendums` | **CRUD ประชามติ** (สร้าง/แก้ไข/ลบคำถาม) |
| `referendum` | PUT `/referendums/:id/toggle` | เปิด/ปิดการแสดงผลประชามติ |
| `referendum` | GET/PUT `/referendums/:id/results` | ผลคะแนนประชามติรายจังหวัด |
| `section` | GET/PUT `/sections` | จัดการ content sections (เปิด/ปิด, ลำดับ) |
| `summary` | GET `/summary/overview` | สรุปภาพรวมทั้งประเทศ |
| `summary` | GET `/summary/region/:id` | สรุปตามภูมิภาค |
| `summary` | GET `/summary/province/:id` | สรุปตามจังหวัด |
| `media` | POST `/media/upload` | อัปโหลดรูปภาพ |
| `settings` | GET/PUT `/settings` | ตั้งค่าระบบ |

**WebSocket Events (Socket.IO):**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `vote:updated` | Server → Client | `{ constituencyId, results[] }` | ผลคะแนนเขตอัปเดต |
| `party:updated` | Server → Client | `{ partyId, totalSeats }` | ที่นั่งพรรคอัปเดต |
| `referendum:updated` | Server → Client | `{ referendumId, approve, disapprove, abstain }` | ผลประชามติอัปเดต |
| `referendum:toggled` | Server → Client | `{ referendumId, isEnabled }` | **ใหม่** — ประชามติถูกเปิด/ปิด |
| `section:toggled` | Server → Client | `{ sectionKey, isEnabled }` | **ใหม่** — section ถูกเปิด/ปิด |
| `counting:progress` | Server → Client | `{ totalCounted, percentage }` | ความคืบหน้าการนับ |
| `subscribe:constituency` | Client → Server | `{ constituencyId }` | ติดตามเขตเลือกตั้ง |
| `subscribe:province` | Client → Server | `{ provinceId }` | ติดตามจังหวัด |

**Real-time Data Flow:**
```mermaid
sequenceDiagram
    participant Admin as CMS Admin
    participant API as NestJS API
    participant Redis as Redis Pub/Sub
    participant WS as Socket.IO Gateway
    participant Client as Browser Client
    
    Admin->>API: PUT /votes (update scores)
    API->>API: Validate & Save to PostgreSQL
    API->>Redis: PUBLISH vote:updated
    API->>Redis: SET cache:summary (invalidate)
    Redis->>WS: Subscribe receives event
    WS->>Client: emit("vote:updated", data)
    Client->>Client: Update UI (React state)
    
    Note over API,Redis: Redis also serves as<br/>API response cache
```

**Caching Strategy:**

| Data | Cache Strategy | TTL |
|------|---------------|-----|
| Party list | Redis + ISR | 60s |
| Summary overview | Redis | 10s |
| Constituency results | Redis | 5s |
| Static assets | CDN | 1 year |
| Province/Region data | Redis + ISR | 5 min |
| Candidate images | CDN | 1 year |

---

### Phase 4: Frontend — หน้าภาพรวม (Overview)

สร้างหน้าแรกที่แสดงผลรวมแบบเรียลไทม์ ดีกว่า reference ด้วย:
- **Progressive loading** — แสดงข้อมูลสำคัญก่อน
- **Animated counters** — ตัวเลขเปลี่ยนแบบ smooth
- **Dark/Light mode** — รองรับทั้ง 2 โหมด (reference มีแค่ dark)
- **Mobile-first responsive** — ปรับ layout ตาม breakpoint

#### [NEW] Overview Components

| Component | Description | Enhancement vs Reference |
|-----------|-------------|------------------------|
| `HeroSection` | Banner + ผลรวมหน่วยนับ + ความคืบหน้า | เพิ่ม animated progress ring |
| `TopPartiesCard` | TOP 3 พรรคพร้อมรูปหัวหน้าพรรค | เพิ่ม sparkline chart แนวโน้ม |
| `PartyLeaderboard` | ตารางอันดับพรรคทั้งหมด | เพิ่ม sorting, filtering, search |
| `ReferendumWidget` | ผลประชามติ — **แสดงเฉพาะเมื่อ `isEnabled=true`** | เพิ่ม donut chart + animation |
| `CountingProgressBar` | ความคืบหน้าการนับคะแนน | เพิ่ม per-region breakdown |
| `LiveUpdateTicker` | แถบข่าวด่วน/อัปเดตล่าสุด | **ใหม่** — ไม่มีใน reference |
| `CompareElectionToggle` | เปรียบเทียบกับการเลือกตั้งครั้งก่อน | ดีกว่า THE STANDARD ที่มีแค่ปุ่ม toggle |
| `DynamicSectionRenderer` | **ใหม่** — render sections ตามค่า `ElectionSection` จาก CMS | ไม่มีใน reference ทุกเว็บ |

> [!TIP]
> **ReferendumWidget** จะ render แบบ conditional:
> ```tsx
> // Pseudo-code: แสดงเฉพาะเมื่อ election มีประชามติ และ section ถูกเปิด
> {election.hasReferendum && sections.referendum?.isEnabled && (
>   <ReferendumWidget referendums={referendums} />
> )}
> ```
> เมื่อ admin toggle ผ่าน CMS → WebSocket event `section:toggled` จะ broadcast ให้หน้า public ซ่อน/แสดง section ทันที

---

### Phase 5: Frontend — หน้าแผนที่ (Map & Constituency)

แผนที่ประเทศไทยแบบ interactive แสดงผลรายเขต

#### [NEW] Map Components

| Component | Description | Enhancement |
|-----------|-------------|-------------|
| `ThailandMap` | SVG map จาก GeoJSON ระบายสีตามพรรคที่นำ | เพิ่ม zoom, pan, hover tooltip |
| `ConstituencyHexGrid` | Hex grid แสดง 400 เขต (เหมือน THE STANDARD) | เพิ่ม animation เมื่ออัปเดต |
| `RegionFilter` | Filter ตามภูมิภาค/จังหวัด | เพิ่ม auto-complete search |
| `ConstituencyDetail` | รายละเอียดเขต + ผู้สมัครและคะแนน | เพิ่ม vote differential bar |
| `MapLegend` | สัญลักษณ์สีของพรรค | Dynamic ตาม parties ที่ปรากฏ |
| `VoteTypeToggle` | สลับดู สส.เขต / บัญชีรายชื่อ / ประชามติ | **ดีกว่า** — เพิ่ม split view |
| `HeatMap` | แผนที่ความร้อนตามสัดส่วนผู้มาใช้สิทธิ | **ใหม่** — ไม่มีใน reference |
| `CloseRaceIndicator` | ไฮไลต์เขตสูสี (คะแนนห่างน้อย) | **ดีกว่า** — แสดง % ความห่าง |

**Map Technology:**
- ใช้ Thailand GeoJSON (ระดับจังหวัด + เขตเลือกตั้ง)
- D3.js สำหรับ projection + interaction
- Canvas fallback สำหรับ low-end devices
- CSS transitions สำหรับสีเปลี่ยน smooth

---

### Phase 6: Frontend — หน้าพรรค & ผู้สมัคร

#### [NEW] Party Detail Pages

| Component | Description |
|-----------|-------------|
| `PartyProfile` | โปรไฟล์พรรค, โลโก้, หัวหน้าพรรค |
| `PartySeatBreakdown` | Donut chart แสดงสัดส่วนที่นั่ง เขต vs บัญชีรายชื่อ |
| `PartyConstituencyList` | รายการเขตที่พรรคชนะ/แพ้ |
| `PartyListCandidateTable` | ตาราง สส.บัญชีรายชื่อ พร้อม rank |
| `CandidateCard` | การ์ดผู้สมัครพร้อมคะแนน |

---

### Phase 7: Frontend — จำลองจัดตั้งรัฐบาล (Coalition Simulator)

จุดเด่นที่ดีกว่า reference ทุกเว็บ:

#### [NEW] Coalition Components

| Component | Description | Enhancement |
|-----------|-------------|-------------|
| `CoalitionBuilder` | ลากพรรคเข้าทีม A/B | **ดีกว่า** — Drag & Drop + animation |
| `SeatCounter` | นับจำนวนที่นั่ง ต้อง ≥ 251 | เพิ่ม progress bar + celebrate animation |
| `CoalitionComparison` | เปรียบเทียบ 2 ทีม | เพิ่ม policy comparison |
| `ShareCoalition` | แชร์ผลลัพธ์ผ่าน social media | **ใหม่** — generate shareable image |
| `PopularCoalitions` | แสดง coalition ยอดนิยมจากผู้ใช้อื่น | **ใหม่** — crowdsourced data |
| `HistoricalComparison` | เปรียบเทียบกับรัฐบาลชุดก่อน | **ใหม่** |

---

### Phase 8: Admin CMS Backend

ระบบจัดการเนื้อหาหลังบ้าน

#### [NEW] Admin Pages — `apps/web/app/admin/`

**CMS Features:**

| Feature | Description |
|---------|-------------|
| **Dashboard** | สรุปภาพรวม — จำนวนเขตที่นับเสร็จ, ที่เหลือ, ผลรวม |
| **จัดการพรรค** | CRUD พรรคการเมือง + อัปโหลดโลโก้/รูปหัวหน้าพรรค |
| **จัดการผู้สมัคร** | CRUD ผู้สมัคร สส.เขต + สส.บัญชีรายชื่อ |
| **จัดการเขตเลือกตั้ง** | กำหนดเขต, จังหวัด, จำนวนผู้มีสิทธิ |
| **บันทึกผลคะแนน** | กรอกคะแนนรายเขต — auto-broadcast ผ่าน Socket.IO |
| **🆕 จัดการประชามติ** | **ดูรายละเอียดด้านล่าง** |
| **🆕 จัดการ Content Sections** | เปิด/ปิด section ต่างๆ บนหน้าบ้าน, จัดลำดับ |
| **Import/Export** | นำเข้า/ส่งออกข้อมูลผ่าน CSV/Excel |
| **จัดการผู้ใช้** | สร้าง Admin/Editor/Viewer accounts |
| **Audit Log** | ดูประวัติการแก้ไขข้อมูลทั้งหมด |
| **ตั้งค่าระบบ** | เปิด/ปิดการรายงานผล, ตั้งค่าข้อความ |

#### 🆕 จัดการประชามติ (Referendum Management) — CMS Detail

Admin สามารถจัดการข้อมูลประชามติได้อย่างเต็มรูปแบบ:

| Action | Description |
|--------|-------------|
| **สร้างคำถามประชามติ** | เพิ่มคำถามใหม่ (ภาษาไทย + อังกฤษ) + คำอธิบาย |
| **แก้ไขคำถาม** | แก้ไขข้อความ, คำอธิบาย |
| **เปิด/ปิดการแสดงผล** | Toggle `isEnabled` → หน้าบ้านแสดง/ซ่อนทันที (real-time) |
| **กำหนดลำดับ** | Drag & Drop เปลี่ยนลำดับคำถาม (ถ้ามีหลายข้อ) |
| **กรอกผลคะแนนรวม** | กรอก เห็นชอบ / ไม่เห็นชอบ / งดออกเสียง / บัตรเสีย |
| **กรอกผลรายจังหวัด** | กรอกผลประชามติแยกตาม 77 จังหวัด |
| **ตั้งค่าสถานะ** | `DRAFT` → `ACTIVE` → `COUNTING` → `COMPLETED` |
| **ลบคำถาม** | ลบคำถามที่ไม่ต้องการ (soft delete) |

**Workflow สำหรับการเพิ่มประชามติ:**
```mermaid
flowchart LR
    A["Admin สร้างคำถาม<br/>(status: DRAFT)"] --> B["กำหนดรายละเอียด<br/>+ เปิด isEnabled"]
    B --> C["เปลี่ยนสถานะเป็น<br/>ACTIVE"]
    C --> D["เริ่มกรอกผลคะแนน<br/>(status: COUNTING)"]
    D --> E["นับเสร็จ<br/>(status: COMPLETED)"]
    
    style A fill:#f0f0f0,stroke:#999
    style C fill:#4CAF50,stroke:#388E3C,color:#fff
    style D fill:#FF9800,stroke:#F57C00,color:#fff
    style E fill:#2196F3,stroke:#1976D2,color:#fff
```

**กรณีไม่มีประชามติในการเลือกตั้ง:**
> Admin ตั้ง `Election.hasReferendum = false` → ไม่ต้องสร้าง record ใน `Referendum` เลย → หน้าบ้านจะไม่แสดง tab/section ประชามติทั้งหมด

#### 🆕 จัดการ Content Sections

Admin สามารถเปิด/ปิด sections ต่างๆ ของหน้าบ้านผ่าน UI แบบ toggle:

| Control | Description |
|---------|-------------|
| **Toggle เปิด/ปิด** | Switch on/off สำหรับแต่ละ section |
| **ลำดับการแสดงผล** | Drag & Drop เปลี่ยนลำดับ section |
| **Config** | ตั้งค่าเพิ่มเติมต่อ section (เช่น จำนวนพรรคที่แสดงใน leaderboard) |

**Admin Role Permissions:**

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | ทุกอย่าง + จัดการผู้ใช้ |
| `ADMIN` | ทุกอย่างยกเว้นจัดการผู้ใช้ |
| `EDITOR` | กรอกคะแนน, แก้ไขข้อมูล |
| `VIEWER` | ดูข้อมูลเท่านั้น |

---

### Phase 9: Performance & Scaling

#### Optimization Strategy

```mermaid
graph LR
    subgraph "Frontend Optimizations"
        SSG["Static Generation<br/>(Build Time)"]
        ISR["ISR Revalidation<br/>(10-60s)"]
        CSR["Client-Side<br/>(Real-time only)"]
        SW["Service Worker<br/>(Offline Support)"]
    end
    
    subgraph "API Optimizations"
        RATE["Rate Limiting<br/>(per IP)"]
        CACHE["Response Cache<br/>(Redis)"]
        COMP["Compression<br/>(Brotli/gzip)"]
        POOL["Connection Pool<br/>(PostgreSQL)"]
    end
    
    subgraph "Infrastructure"
        CDN2["CDN Edge Cache"]
        LB["Load Balancer"]
        REPLICA["Read Replicas"]
        STICKY["Sticky Sessions<br/>(WebSocket)"]
    end
```

**Key Performance Targets:**

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | SSG + CDN |
| Time to Interactive | < 3s | Code splitting + lazy load |
| Real-time latency | < 500ms | Redis Pub/Sub + Socket.IO |
| Concurrent users | 100K+ | CDN + Redis + Horizontal scaling |
| API response time | < 100ms | Redis cache + DB index |

**Scaling Strategies:**
1. **CDN-first**: Static pages served from CDN edge, API calls cached 5-10s
2. **Redis Pub/Sub**: Decouple write (admin) from read (public) paths
3. **ISR**: Revalidate pages every 10s instead of per-request SSR
4. **WebSocket rooms**: Subscribe only to relevant constituencies
5. **Database read replicas**: Separate read traffic from writes
6. **Rate limiting**: Prevent API abuse during peak traffic

---

## สิ่งที่ดีกว่า Reference Sites

| Feature | THE STANDARD | Workpoint | Vote62 | **Our System** |
|---------|-------------|-----------|--------|---------------|
| Real-time updates | ✅ | ✅ | ✅ | ✅ WebSocket + optimistic UI |
| Interactive map | ✅ Hex grid | ❌ | ✅ Choropleth | ✅ **Both** hex grid + choropleth + heatmap |
| Mobile responsive | ⚠️ Basic | ✅ | ✅ | ✅ **Mobile-first** design |
| Dark/Light mode | Dark only | Light only | Light only | ✅ **Both** modes |
| Government simulator | ✅ Team A/B | ✅ Select parties | ❌ | ✅ **Drag & drop** + share + popular choices |
| Comparison with past | ⚠️ Toggle only | ❌ | ❌ | ✅ **Side-by-side** comparison |
| CMS backend | Unknown | Unknown | Unknown | ✅ **Full CMS** with RBAC |
| Search functionality | ✅ | ❌ | ❌ | ✅ **Global search** (party, candidate, constituency) |
| Accessibility | ⚠️ | ⚠️ | ⚠️ | ✅ **WCAG 2.1 AA** compliant |
| SEO | ✅ | ✅ | ⚠️ | ✅ **Dynamic OG images** per page |
| Live news ticker | ❌ | ❌ | ❌ | ✅ **ใหม่** |
| Vote heatmap | ❌ | ❌ | ❌ | ✅ **ใหม่** |
| Close race alerts | ✅ Basic | ❌ | ❌ | ✅ **Enhanced** with % |
| Data export | ❌ | ❌ | ✅ CSV | ✅ CSV + Excel + API |
| Historical data | ❌ | ❌ | ✅ Multi-year | ✅ **Multi-year** with comparison |

---

## Implementation Order

| Phase | Description | Estimated Effort |
|-------|-------------|-----------------|
| **1** | Project Setup & Monorepo Foundation | 2-3 hours |
| **2** | Database Design & Prisma Schema | 2-3 hours |
| **3** | Backend API & WebSocket Gateway | 4-6 hours |
| **4** | Frontend — Overview Page | 4-6 hours |
| **5** | Frontend — Map & Constituency View | 6-8 hours |
| **6** | Frontend — Party & Candidate Details | 3-4 hours |
| **7** | Frontend — Coalition Simulator | 3-4 hours |
| **8** | Admin CMS | 6-8 hours |
| **9** | Performance, Testing & Polish | 3-4 hours |

**Total estimated: ~35-45 hours**

---

## Verification Plan

### Automated Tests

1. **Backend Unit Tests** (NestJS + Jest)
   ```bash
   cd apps/api && npm run test
   ```
   - Test all CRUD operations for parties, candidates, constituencies
   - Test vote calculation logic (party-list seat allocation)
   - Test WebSocket gateway event emission

2. **Frontend Component Tests** (Vitest + React Testing Library)
   ```bash
   cd apps/web && npm run test
   ```
   - Test PartyLeaderboard sorting/filtering
   - Test CoalitionBuilder seat counting
   - Test ReferendumWidget calculations

3. **E2E Build Validation**
   ```bash
   npm run build
   ```
   - Ensure the full monorepo builds without errors

### Manual Verification

1. **Real-time Updates**: 
   - เปิด 2 browser tabs — Tab 1 เป็น admin กรอกคะแนน, Tab 2 เป็นหน้า public
   - เมื่อกรอกคะแนนใน admin → หน้า public ต้องอัปเดตทันทีโดยไม่ต้อง refresh

2. **Map Interaction**:
   - คลิกแผนที่จังหวัด → แสดง popup ข้อมูลเขต
   - Zoom in/out → แผนที่ต้องไม่กระตุก

3. **Coalition Simulator**:
   - เลือกพรรคเข้าทีม → ตัวเลขที่นั่งต้องรวมถูกต้อง
   - ถ้าครบ 251+ ที่นั่ง → แสดงข้อความ "จัดตั้งรัฐบาลได้"

4. **ผู้ใช้แนะนำการทดสอบเพิ่มเติม** — กรุณาแจ้งหากต้องการทดสอบ scenario อื่น ๆ
