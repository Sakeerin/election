import Navbar from '@/components/layout/Navbar';
import CoalitionBuilder from '@/components/coalition/CoalitionBuilder';
import { fetchOverviewData } from '@/lib/fetchOverviewData';

export const revalidate = 10;

export default async function CoalitionPage() {
    const data = await fetchOverviewData();

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar
                electionName={data.election.name}
                electionDate={data.election.electionDate}
                countingPercentage={data.countingPercentage}
            />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white mb-4">จำลองการจัดตั้งรัฐบาล</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        เลือกพรรคการเมืองต่างๆ เพื่อจำลองสูตรการจัดตั้งรัฐบาล และตรวจสอบว่ามีที่นั่งเพียงพอ (251 ที่นั่งขึ้นไป) หรือไม่
                    </p>
                </div>

                <CoalitionBuilder parties={data.parties} />
                
                <section className="mt-20 rounded-3xl border border-slate-700/60 bg-blue-500/5 p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">เงื่อนไขการจัดตั้งรัฐบาล</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                        <div>
                            <div className="text-3xl font-black text-blue-500 mb-2">251</div>
                            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">เสียงข้างมากในสภาผู้แทนฯ</p>
                            <p className="text-xs text-slate-500 mt-2">ต้องการเสียงเกินกึ่งหนึ่งของ สส. 500 คน เพื่อจัดตั้งรัฐบาลที่มีเสถียรภาพ</p>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-purple-500 mb-2">376</div>
                            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">เสียงในการเลือกนายกรัฐมนตรี</p>
                            <p className="text-xs text-slate-500 mt-2">ต้องการเสียงเกินกึ่งหนึ่งของรัฐสภา (สส. 500 + สว. 250) เพื่อโหวตเลือกนายกฯ</p>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-green-500 mb-2">500</div>
                            <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider">จำนวน สส. ทั้งหมด</p>
                            <p className="text-xs text-slate-500 mt-2">แบ่งเป็น สส. เขต 400 คน และ สส. บัญชีรายชื่อ 100 คน</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
