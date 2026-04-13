import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import CandidateProfile from '@/components/candidate/CandidateProfile';
import ConstituencyComparison from '@/components/candidate/ConstituencyComparison';
import { fetchOverviewData } from '@/lib/fetchOverviewData';
import { fetchCandidateDetail } from '@/lib/fetchCandidateDetail';

interface CandidatePageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 10;

export default async function CandidatePage({ params }: CandidatePageProps) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    const [overview, data] = await Promise.all([
        fetchOverviewData(),
        fetchCandidateDetail(id),
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

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                <div className="space-y-8">
                    {/* Candidate Profile Header */}
                    <CandidateProfile data={data} />
                    
                    {/* Comparison with others in constituency */}
                    <ConstituencyComparison 
                        results={data.results}
                        currentCandidateId={data.candidate.id}
                    />
                </div>
            </main>

            <footer className="border-t border-slate-800 py-10 text-center text-slate-500 text-xs mt-10">
                <p>ข้อมูลอัปเดตแบบเรียลไทม์จากระบบประมวลผลกลาง</p>
            </footer>
        </div>
    );
}
