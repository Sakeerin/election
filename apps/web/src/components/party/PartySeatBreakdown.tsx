import { IPartyDetail } from '@election/shared';

interface PartySeatBreakdownProps {
    constituencySeats: number;
    partyListSeats: number;
    totalSeats: number;
    totalVotes: number;
    partyColor: string;
}

export default function PartySeatBreakdown({
    constituencySeats,
    partyListSeats,
    totalSeats,
    totalVotes,
    partyColor,
}: PartySeatBreakdownProps) {
    const constituencyPercentage = totalSeats > 0 ? (constituencySeats / totalSeats) * 100 : 0;
    const partyListPercentage = totalSeats > 0 ? (partyListSeats / totalSeats) * 100 : 0;

    return (
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-white mb-6">สรุปที่นั่งที่ได้รับ</h3>
            
            <div className="flex items-end justify-center gap-10 mb-8">
                <div className="text-center">
                    <p className="text-5xl font-black text-white">{totalSeats}</p>
                    <p className="text-sm text-slate-400 mt-1">ที่นั่งทั้งหมด</p>
                </div>
                <div className="h-12 w-px bg-slate-700" />
                <div className="text-center">
                    <p className="text-3xl font-bold text-slate-300">{totalVotes.toLocaleString('th-TH')}</p>
                    <p className="text-sm text-slate-400 mt-1">คะแนนเสียงรวม</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-300 font-semibold">สส. แบบแบ่งเขต</p>
                        <p className="text-lg font-bold text-white">{constituencySeats}</p>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                                width: `${constituencyPercentage}%`,
                                backgroundColor: partyColor 
                            }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-slate-300 font-semibold">สส. แบบบัญชีรายชื่อ</p>
                        <p className="text-lg font-bold text-white">{partyListSeats}</p>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000 opacity-70" 
                            style={{ 
                                width: `${partyListPercentage}%`,
                                backgroundColor: partyColor 
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-950/50 p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">สัดส่วนที่นั่งเขต</p>
                    <p className="text-xl font-bold text-slate-200">{constituencyPercentage.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl bg-slate-950/50 p-4 border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">สัดส่วนบัญชีรายชื่อ</p>
                    <p className="text-xl font-bold text-slate-200">{partyListPercentage.toFixed(1)}%</p>
                </div>
            </div>
        </div>
    );
}
