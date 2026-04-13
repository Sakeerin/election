'use client';

import { VoteType } from '@/lib/mapData';

interface VoteTypeToggleProps {
    value: VoteType;
    onChange: (value: VoteType) => void;
}

const OPTIONS: Array<{ value: VoteType; label: string; subtitle: string }> = [
    { value: 'constituency', label: 'สส.เขต', subtitle: 'คะแนนรายเขต' },
    { value: 'party_list', label: 'บัญชีรายชื่อ', subtitle: 'คะแนนรวมพรรค' },
    { value: 'referendum', label: 'ประชามติ', subtitle: 'ผลคำถามประชามติ' },
];

export default function VoteTypeToggle({ value, onChange }: VoteTypeToggleProps) {
    return (
        <div className="inline-flex rounded-2xl border border-slate-700/70 bg-slate-900/80 p-1.5 shadow-lg shadow-black/20">
            {OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`rounded-xl px-4 py-2 text-left transition-all duration-300 ${
                        value === option.value
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-[11px] opacity-80">{option.subtitle}</p>
                </button>
            ))}
        </div>
    );
}
