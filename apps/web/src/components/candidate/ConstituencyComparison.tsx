import { ICandidateDetail } from '@election/shared';

interface ConstituencyComparisonProps {
    results: ICandidateDetail['results'];
    currentCandidateId: number;
}

export default function ConstituencyComparison({ results, currentCandidateId }: ConstituencyComparisonProps) {
    const topVotes = results[0]?.voteCount ?? 1;

    return (
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/50 p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6">ผลคะแนนในเขตเลือกตั้ง</h3>
            
            <div className="space-y-4">
                {results.map((result, index) => {
                    const isCurrent = result.candidateId === currentCandidateId;
                    const percentage = (result.voteCount / topVotes) * 100;
                    
                    return (
                        <div 
                            key={result.candidateId}
                            className={`rounded-2xl border p-4 transition-all ${
                                isCurrent 
                                    ? 'border-blue-500 bg-blue-500/10' 
                                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-black ${index === 0 ? 'text-yellow-500' : 'text-slate-500'}`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className={`font-bold ${isCurrent ? 'text-blue-400' : 'text-slate-200'}`}>
                                            {result.candidateNameTh}
                                        </p>
                                        <p className="text-xs text-slate-500">{result.partyNameTh}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">{result.voteCount.toLocaleString('th-TH')}</p>
                                    <p className="text-xs text-slate-500">คะแนน</p>
                                </div>
                            </div>
                            
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000" 
                                    style={{ 
                                        width: `${Math.max(2, percentage)}%`,
                                        backgroundColor: result.partyColor 
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
