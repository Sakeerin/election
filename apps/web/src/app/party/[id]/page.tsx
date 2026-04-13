import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import PartyProfile from '@/components/party/PartyProfile';
import PartySeatBreakdown from '@/components/party/PartySeatBreakdown';
import PartyConstituencyList from '@/components/party/PartyConstituencyList';
import PartyListCandidateTable from '@/components/party/PartyListCandidateTable';
import { fetchOverviewData } from '@/lib/fetchOverviewData';
import { fetchPartyDetail } from '@/lib/fetchPartyDetail';

interface PartyPageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 10;

export default async function PartyPage({ params }: PartyPageProps) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    const [overview, data] = await Promise.all([
        fetchOverviewData(),
        fetchPartyDetail(id),
    ]);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar
                electionName={overview.election.name}
                electionDate={overview.election.electionDate}
                countingPercentage={overview.countingPercentage}
            />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                {/* Party Profile Header */}
                <div className="mb-8">
                    <PartyProfile party={data.party} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Seat Breakdown */}
                    <div className="lg:col-span-1 space-y-8">
                        <PartySeatBreakdown 
                            constituencySeats={data.constituencySeats}
                            partyListSeats={data.partyListSeats}
                            totalSeats={data.totalSeats}
                            totalVotes={data.totalVotes}
                            partyColor={data.party.color}
                        />
                        
                        <PartyConstituencyList 
                            constituencyWins={data.constituencyWins}
                            partyColor={data.party.color}
                        />
                    </div>

                    {/* Right Column - Party List Candidates */}
                    <div className="lg:col-span-2">
                        <PartyListCandidateTable 
                            candidates={data.partyListCandidates}
                            allocatedSeats={data.partyListSeats}
                        />
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-800 py-10 text-center text-slate-500 text-xs mt-10">
                <p>ข้อมูลนี้เป็นข้อมูลแบบเรียลไทม์ อาจมีการเปลี่ยนแปลงตามการนับคะแนน</p>
            </footer>
        </div>
    );
}
