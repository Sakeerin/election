-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('GENERAL', 'BY_ELECTION');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COUNTING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConstituencyStatus" AS ENUM ('PENDING', 'COUNTING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReferendumStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COUNTING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "elections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "type" "ElectionType" NOT NULL DEFAULT 'GENERAL',
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "hasReferendum" BOOLEAN NOT NULL DEFAULT false,
    "totalEligibleVoters" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_sections" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "sectionType" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "election_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" SERIAL NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "abbreviation" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#333333',
    "logoUrl" TEXT,
    "leaderName" TEXT,
    "leaderImageUrl" TEXT,
    "partyNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituencies" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "constituencyNumber" INTEGER NOT NULL,
    "eligibleVoters" INTEGER NOT NULL DEFAULT 0,
    "totalVoters" INTEGER NOT NULL DEFAULT 0,
    "goodBallots" INTEGER NOT NULL DEFAULT 0,
    "badBallots" INTEGER NOT NULL DEFAULT 0,
    "noVoteBallots" INTEGER NOT NULL DEFAULT 0,
    "countingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ConstituencyStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "constituencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER NOT NULL,
    "constituencyId" INTEGER NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "candidateNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituency_results" (
    "id" SERIAL NOT NULL,
    "constituencyId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "partyId" INTEGER NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "isLeading" BOOLEAN NOT NULL DEFAULT false,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constituency_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_list_candidates" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,

    CONSTRAINT "party_list_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_list_allocations" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "partyId" INTEGER NOT NULL,
    "totalPartyListVotes" INTEGER NOT NULL DEFAULT 0,
    "allocatedSeats" INTEGER NOT NULL DEFAULT 0,
    "constituencySeats" INTEGER NOT NULL DEFAULT 0,
    "totalSeats" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "party_list_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referendums" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "questionTh" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL DEFAULT '',
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ReferendumStatus" NOT NULL DEFAULT 'DRAFT',
    "totalEligibleVoters" INTEGER NOT NULL DEFAULT 0,
    "totalVoters" INTEGER NOT NULL DEFAULT 0,
    "approveCount" INTEGER NOT NULL DEFAULT 0,
    "disapproveCount" INTEGER NOT NULL DEFAULT 0,
    "abstainCount" INTEGER NOT NULL DEFAULT 0,
    "badBallots" INTEGER NOT NULL DEFAULT 0,
    "countingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referendums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referendum_results" (
    "id" SERIAL NOT NULL,
    "referendumId" INTEGER NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "approveCount" INTEGER NOT NULL DEFAULT 0,
    "disapproveCount" INTEGER NOT NULL DEFAULT 0,
    "abstainCount" INTEGER NOT NULL DEFAULT 0,
    "totalVoters" INTEGER NOT NULL DEFAULT 0,
    "countingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referendum_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT '',
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "elections_status_idx" ON "elections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "election_sections_electionId_sectionKey_key" ON "election_sections"("electionId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE INDEX "constituencies_electionId_idx" ON "constituencies"("electionId");

-- CreateIndex
CREATE INDEX "constituencies_provinceId_idx" ON "constituencies"("provinceId");

-- CreateIndex
CREATE INDEX "constituencies_status_idx" ON "constituencies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "constituencies_electionId_provinceId_constituencyNumber_key" ON "constituencies"("electionId", "provinceId", "constituencyNumber");

-- CreateIndex
CREATE INDEX "candidates_partyId_idx" ON "candidates"("partyId");

-- CreateIndex
CREATE INDEX "candidates_constituencyId_idx" ON "candidates"("constituencyId");

-- CreateIndex
CREATE INDEX "constituency_results_constituencyId_idx" ON "constituency_results"("constituencyId");

-- CreateIndex
CREATE INDEX "constituency_results_partyId_idx" ON "constituency_results"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "constituency_results_constituencyId_candidateId_key" ON "constituency_results"("constituencyId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "party_list_candidates_partyId_rank_key" ON "party_list_candidates"("partyId", "rank");

-- CreateIndex
CREATE INDEX "party_list_allocations_electionId_idx" ON "party_list_allocations"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "party_list_allocations_electionId_partyId_key" ON "party_list_allocations"("electionId", "partyId");

-- CreateIndex
CREATE INDEX "referendum_results_referendumId_idx" ON "referendum_results"("referendumId");

-- CreateIndex
CREATE UNIQUE INDEX "referendum_results_referendumId_provinceId_key" ON "referendum_results"("referendumId", "provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "election_sections" ADD CONSTRAINT "election_sections_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituency_results" ADD CONSTRAINT "constituency_results_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituency_results" ADD CONSTRAINT "constituency_results_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituency_results" ADD CONSTRAINT "constituency_results_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_list_candidates" ADD CONSTRAINT "party_list_candidates_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_list_allocations" ADD CONSTRAINT "party_list_allocations_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_list_allocations" ADD CONSTRAINT "party_list_allocations_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referendums" ADD CONSTRAINT "referendums_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referendum_results" ADD CONSTRAINT "referendum_results_referendumId_fkey" FOREIGN KEY ("referendumId") REFERENCES "referendums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referendum_results" ADD CONSTRAINT "referendum_results_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
