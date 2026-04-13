import Image from 'next/image';
import Link from 'next/link';
import { ICandidateDetail } from '@election/shared';

interface CandidateProfileProps {
    data: ICandidateDetail;
}

export default function CandidateProfile({ data }: CandidateProfileProps) {
    const { candidate, constituency } = data;
    
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6 md:p-10">
            <div className="relative h-48 w-48 md:h-64 md:w-64 flex-shrink-0 overflow-hidden rounded-3xl border-4 border-slate-800 bg-slate-800 shadow-2xl">
                {candidate.imageUrl ? (
                    <Image
                        src={candidate.imageUrl}
                        alt={candidate.nameTh}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-700 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                )}
                
                <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-slate-900">{candidate.candidateNumber}</span>
                </div>
            </div>

            <div className="flex-1 text-center md:text-left">
                <nav className="mb-4 flex flex-wrap justify-center md:justify-start gap-2 text-sm text-slate-400">
                    <span>{constituency.province.region.nameTh}</span>
                    <span>/</span>
                    <Link href={`/map?province=${constituency.provinceId}`} className="hover:text-blue-400 transition-colors">
                        {constituency.province.nameTh}
                    </Link>
                    <span>/</span>
                    <Link href={`/constituency/${constituency.id}`} className="hover:text-blue-400 transition-colors">
                        เขต {constituency.constituencyNumber}
                    </Link>
                </nav>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{candidate.nameTh}</h1>
                {candidate.nameEn && <p className="text-xl text-slate-400 mb-6">{candidate.nameEn}</p>}
                
                <Link 
                    href={`/party/${candidate.partyId}`}
                    className="inline-flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 hover:bg-slate-800 transition-all group"
                >
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white p-1">
                        {candidate.party.logoUrl ? (
                            <Image
                                src={candidate.party.logoUrl}
                                alt={candidate.party.nameTh}
                                fill
                                className="object-contain p-1"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-bold text-slate-400">
                                {candidate.party.abbreviation || candidate.party.nameTh[0]}
                            </div>
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">สังกัดพรรค</p>
                        <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{candidate.party.nameTh}</p>
                    </div>
                </Link>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4">
                        <p className="text-xs text-slate-500 uppercase mb-1">สถานะในเขต</p>
                        {data.results.find(r => r.candidateId === candidate.id)?.isWinner ? (
                            <span className="text-lg font-bold text-green-500 flex items-center gap-2 justify-center md:justify-start">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                                ชนะการเลือกตั้ง
                            </span>
                        ) : data.results.find(r => r.candidateId === candidate.id)?.isLeading ? (
                            <span className="text-lg font-bold text-yellow-500 flex items-center gap-2 justify-center md:justify-start">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                </svg>
                                กำลังนำ
                            </span>
                        ) : (
                            <span className="text-lg font-bold text-slate-400">กำลังนับคะแนน</span>
                        )}
                    </div>

                    <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 text-center md:text-left">
                        <p className="text-xs text-slate-500 uppercase mb-1">คะแนนที่ได้รับ</p>
                        <p className="text-2xl font-black text-white">
                            {data.results.find(r => r.candidateId === candidate.id)?.voteCount.toLocaleString('th-TH') || 0}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/40 border border-slate-800 p-4 text-center md:text-left">
                        <p className="text-xs text-slate-500 uppercase mb-1">อันดับในเขต</p>
                        <p className="text-2xl font-black text-white">
                            #{data.results.findIndex(r => r.candidateId === candidate.id) + 1}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
