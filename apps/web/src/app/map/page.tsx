import Navbar from '@/components/layout/Navbar';
import MapViewPage from '@/components/map/MapViewPage';
import { fetchOverviewData } from '@/lib/fetchOverviewData';

export const revalidate = 10;

export default async function MapPage() {
    const overview = await fetchOverviewData();

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar
                electionName={overview.election.name}
                electionDate={overview.election.electionDate}
                countingPercentage={overview.countingPercentage}
            />
            <MapViewPage overview={overview} />
        </div>
    );
}
