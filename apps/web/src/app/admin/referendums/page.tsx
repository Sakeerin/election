'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IReferendum } from '@election/shared';

export default function AdminReferendumsPage() {
    const [referendums, setReferendums] = useState<IReferendum[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReferendums = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/referendums?electionId=1`);
                const data = await response.json();
                setReferendums(data);
            } catch (err) {
                console.error('Error fetching referendums:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReferendums();
    }, []);

    const toggleReferendum = async (id: number, isEnabled: boolean) => {
        try {
            const token = localStorage.getItem('admin_token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/referendums/${id}/toggle`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isEnabled: !isEnabled }),
            });
            
            setReferendums(prev => prev.map(r => 
                r.id === id ? { ...r, isEnabled: !isEnabled } : r
            ));
        } catch (err) {
            console.error('Error toggling referendum:', err);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white">จัดการประชามติ</h1>
                    <p className="text-slate-400">สร้าง แก้ไข และเปิด/ปิดการแสดงผลประชามติ</p>
                </div>
                <button className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-all">
                    + สร้างคำถามใหม่
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {referendums.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-800 p-20 text-center text-slate-500">
                            ยังไม่มีการสร้างคำถามประชามติ
                        </div>
                    ) : (
                        referendums.map((r) => (
                            <div key={r.id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                r.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                r.status === 'COUNTING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                                {r.status}
                                            </span>
                                            <span className="text-xs text-slate-500">ลำดับการแสดงผล: {r.displayOrder}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{r.questionTh}</h3>
                                        <p className="text-sm text-slate-400 mb-6">{r.descriptionTh || 'ไม่มีคำอธิบาย'}</p>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">เห็นชอบ</p>
                                                <p className="text-lg font-black text-green-500">{r.approveCount.toLocaleString('th-TH')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">ไม่เห็นชอบ</p>
                                                <p className="text-lg font-black text-red-500">{r.disapproveCount.toLocaleString('th-TH')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">งดออกเสียง</p>
                                                <p className="text-lg font-black text-slate-400">{r.abstainCount.toLocaleString('th-TH')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">นับแล้ว</p>
                                                <p className="text-lg font-black text-blue-500">{r.countingProgress}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3 justify-end">
                                        <button 
                                            onClick={() => toggleReferendum(r.id, r.isEnabled)}
                                            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                                                r.isEnabled 
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                            }`}
                                        >
                                            {r.isEnabled ? '● กำลังแสดงผล' : '○ ซ่อนจากหน้าบ้าน'}
                                        </button>
                                        <button className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700">
                                            แก้ไขคำถาม
                                        </button>
                                        <button className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700">
                                            บันทึกผลคะแนน
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
