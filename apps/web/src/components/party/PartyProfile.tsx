import Image from 'next/image';
import { IPartyDetail } from '@election/shared';

interface PartyProfileProps {
    party: IPartyDetail['party'];
}

export default function PartyProfile({ party }: PartyProfileProps) {
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6 md:p-8">
            <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-white p-2">
                {party.logoUrl ? (
                    <Image
                        src={party.logoUrl}
                        alt={party.nameTh}
                        fill
                        className="object-contain p-2"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-3xl font-bold text-slate-400">
                        {party.abbreviation || party.nameTh[0]}
                    </div>
                )}
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="mb-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h1 className="text-3xl md:text-4xl font-black text-white">{party.nameTh}</h1>
                    <span 
                        className="self-center md:self-auto rounded-full px-4 py-1 text-sm font-bold text-white"
                        style={{ backgroundColor: party.color }}
                    >
                        หมายเลข {party.partyNumber}
                    </span>
                </div>
                
                {party.nameEn && <p className="text-lg text-slate-400 mb-4">{party.nameEn}</p>}
                
                <div className="mt-6 flex flex-col md:flex-row gap-6 md:gap-10">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800">
                            {party.leaderImageUrl ? (
                                <Image
                                    src={party.leaderImageUrl}
                                    alt={party.leaderName || 'หัวหน้าพรรค'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-700 text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">หัวหน้าพรรค</p>
                            <p className="text-lg font-bold text-slate-200">{party.leaderName || 'ไม่ระบุข้อมูล'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-l border-slate-800 pl-0 md:pl-10">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">ชื่อย่อ</p>
                            <p className="text-lg font-bold text-slate-200">{party.abbreviation || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">สีประจำพรรค</p>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: party.color }} />
                                <p className="text-sm font-mono text-slate-400 uppercase">{party.color}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
