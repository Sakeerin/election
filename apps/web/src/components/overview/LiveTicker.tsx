'use client';

import { useRef } from 'react';
import { Radio } from 'lucide-react';

interface LiveTickerProps {
    items: string[];
}

export default function LiveTicker({ items }: LiveTickerProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    // Duplicate items to create seamless loop
    const allItems = [...items, ...items];

    return (
        <div className="bg-slate-900 border-y border-slate-800 py-2.5 overflow-hidden">
            <div className="flex items-center">
                {/* Label */}
                <div className="flex-shrink-0 flex items-center gap-2 pl-4 pr-5 border-r border-slate-700 mr-4">
                    <Radio size={14} className="text-red-500 animate-pulse flex-shrink-0" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        ล่าสุด
                    </span>
                </div>

                {/* Scrolling track */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Left fade */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
                    {/* Right fade */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                    <div
                        ref={trackRef}
                        className="flex gap-0 animate-ticker whitespace-nowrap"
                        style={{
                            animationDuration: `${Math.max(20, items.length * 8)}s`,
                        }}
                    >
                        {allItems.map((item, i) => (
                            <span key={i} className="inline-flex items-center text-sm text-slate-300 px-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 flex-shrink-0" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
