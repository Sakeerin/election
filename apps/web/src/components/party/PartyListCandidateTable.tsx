import Image from 'next/image';
import { IPartyListCandidate } from '@election/shared';

interface PartyListCandidateTableProps {
    candidates: IPartyListCandidate[];
    allocatedSeats: number;
}

export default function PartyListCandidateTable({ candidates, allocatedSeats }: PartyListCandidateTableProps) {
    return (
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-6">รายชื่อ สส. บัญชีรายชื่อ</h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="pb-4 pl-4 font-semibold">ลำดับ</th>
                            <th className="pb-4 font-semibold">รายชื่อ</th>
                            <th className="pb-4 text-right pr-4 font-semibold">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-10 text-center text-slate-500">
                                    ไม่มีข้อมูลผู้สมัครบัญชีรายชื่อ
                                </td>
                            </tr>
                        ) : (
                            candidates.map((candidate) => (
                                <tr key={candidate.id} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 pl-4 text-lg font-black text-slate-600 group-hover:text-slate-400 transition-colors">
                                        {candidate.rank}
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
                                                {candidate.imageUrl ? (
                                                    <Image
                                                        src={candidate.imageUrl}
                                                        alt={candidate.nameTh}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-700 text-slate-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">{candidate.nameTh}</p>
                                                {candidate.nameEn && <p className="text-xs text-slate-500">{candidate.nameEn}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        {candidate.rank <= allocatedSeats ? (
                                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-500 border border-green-500/20">
                                                คาดว่าจะได้ที่นั่ง
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-800/50 px-2.5 py-0.5 text-xs font-bold text-slate-500 border border-slate-700/50">
                                                ลำดับถัดไป
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
