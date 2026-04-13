'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { IPartySummary } from '@election/shared';

interface CoalitionBuilderProps {
    parties: IPartySummary[];
}

export default function CoalitionBuilder({ parties }: CoalitionBuilderProps) {
    const [selectedPartyIds, setSelectedPartyIds] = useState<number[]>([]);

    const selectedParties = useMemo(() => {
        return parties.filter(p => selectedPartyIds.includes(p.party.id));
    }, [parties, selectedPartyIds]);

    const availableParties = useMemo(() => {
        return parties.filter(p => !selectedPartyIds.includes(p.party.id));
    }, [parties, selectedPartyIds]);

    const totalSeats = useMemo(() => {
        return selectedParties.reduce((sum, p) => sum + p.totalSeats, 0);
    }, [selectedParties]);

    const toggleParty = (id: number) => {
        setSelectedPartyIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const isMajority = totalSeats >= 251;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Available Parties */}
            <div className="lg:col-span-1 space-y-6">
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">พรรคการเมืองที่พร้อมเข้าร่วม</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableParties.map((p) => (
                            <button
                                key={p.party.id}
                                onClick={() => toggleParty(p.party.id)}
                                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative h-8 w-8 overflow-hidden rounded bg-white p-1">
                                        {p.party.logoUrl ? (
                                            <Image src={p.party.logoUrl} alt={p.party.nameTh} fill className="object-contain" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[8px] font-bold text-slate-400">
                                                {p.party.abbreviation || p.party.nameTh[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400">{p.party.nameTh}</p>
                                        <p className="text-[10px] text-slate-500">{p.totalSeats} ที่นั่ง</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-600 group-hover:text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Area: Coalition Summary & Selected Parties */}
            <div className="lg:col-span-2 space-y-8">
                {/* Coalition Status Card */}
                <div className={`rounded-3xl border-2 p-8 transition-all ${
                    isMajority ? 'border-green-500 bg-green-500/10' : 'border-yellow-500 bg-yellow-500/10'
                }`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-sm text-slate-400 uppercase tracking-widest mb-1 font-bold">ที่นั่งรวมฝั่งรัฐบาล</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-7xl font-black ${isMajority ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {totalSeats}
                                </span>
                                <span className="text-xl text-slate-400">/ 500</span>
                            </div>
                        </div>
                        
                        <div className="text-center md:text-right">
                            {isMajority ? (
                                <div className="space-y-2">
                                    <span className="inline-flex items-center rounded-full bg-green-500 px-6 py-2 text-lg font-black text-slate-950">
                                        จัดตั้งรัฐบาลได้
                                    </span>
                                    <p className="text-sm text-green-400/80">คะแนนเสียงเกินกึ่งหนึ่ง (251+)</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <span className="inline-flex items-center rounded-full bg-yellow-500 px-6 py-2 text-lg font-black text-slate-950">
                                        ยังไม่พอจัดตั้งรัฐบาล
                                    </span>
                                    <p className="text-sm text-yellow-400/80">ต้องการอีก {251 - totalSeats} ที่นั่ง</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-8 h-4 w-full bg-slate-800/50 rounded-full overflow-hidden p-1 border border-slate-700">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${isMajority ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min(100, (totalSeats / 500) * 100)}%` }}
                        />
                        <div 
                            className="absolute h-6 w-1 bg-white shadow-lg z-10 -top-1" 
                            style={{ left: '50.2%' }} 
                            title="251 ที่นั่ง"
                        />
                    </div>
                </div>

                {/* Selected Parties Grid */}
                <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-6">พรรคที่เลือกเข้าร่วม ({selectedParties.length})</h3>
                    
                    {selectedParties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
                            <p className="text-lg">เลือกพรรคการเมืองเพื่อจำลองการจัดตั้งรัฐบาล</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {selectedParties.map((p) => (
                                <div 
                                    key={p.party.id}
                                    className="relative group rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-center hover:border-red-500/50 transition-all"
                                >
                                    <button 
                                        onClick={() => toggleParty(p.party.id)}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    
                                    <div className="relative mx-auto h-16 w-16 mb-4 overflow-hidden rounded-xl bg-white p-2">
                                        {p.party.logoUrl ? (
                                            <Image src={p.party.logoUrl} alt={p.party.nameTh} fill className="object-contain" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">
                                                {p.party.abbreviation || p.party.nameTh[0]}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-200 truncate">{p.party.nameTh}</p>
                                    <p className="text-xl font-black text-white mt-1">{p.totalSeats}</p>
                                    <div 
                                        className="mt-3 h-1 w-12 mx-auto rounded-full" 
                                        style={{ backgroundColor: p.party.color }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
