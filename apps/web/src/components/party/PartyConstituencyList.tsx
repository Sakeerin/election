import Link from 'next/link';
import { IPartyDetail } from '@election/shared';

interface PartyConstituencyListProps {
    constituencyWins: IPartyDetail['constituencyWins'];
    partyColor: string;
}

export default function PartyConstituencyList({ constituencyWins, partyColor }: PartyConstituencyListProps) {
    return (
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-6">เขตที่ชนะเลือกตั้ง ({constituencyWins.length})</h3>
            
            {constituencyWins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 opacity-20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                    </svg>
                    <p>ยังไม่มีข้อมูลเขตที่ชนะเลือกตั้ง</p>
                </div>
            ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {constituencyWins.map((win) => (
                        <Link 
                            key={win.constituencyId}
                            href={`/constituency/${win.constituencyId}`}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-600 transition-all group"
                        >
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">{win.provinceNameTh}</p>
                                <p className="text-sm font-bold text-white group-hover:text-blue-400">เขต {win.constituencyNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-200">{win.candidateNameTh}</p>
                                <p className="text-xs text-slate-500">{win.voteCount.toLocaleString('th-TH')} คะแนน</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
