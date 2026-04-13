import { fetchOverviewData } from '@/lib/fetchOverviewData';
import Navbar from '@/components/layout/Navbar';
import DynamicSectionRenderer from '@/components/overview/DynamicSectionRenderer';

// ISR: revalidate every 10 seconds
export const revalidate = 10;

export default async function OverviewPage() {
    const data = await fetchOverviewData();

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar
                electionName={data.election.name}
                electionDate={data.election.electionDate}
                countingPercentage={data.countingPercentage}
            />
            <main>
                <DynamicSectionRenderer initialData={data} />
            </main>
            <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs mt-10">
                <p>ข้อมูลอัปเดตล่าสุด: {new Date(data.lastUpdated).toLocaleString('th-TH')}</p>
                <p className="mt-1">ระบบรายงานผลการเลือกตั้งแบบเรียลไทม์</p>
            </footer>
        </div>
    );
}
