'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { IParty } from '@election/shared';

export default function AdminPartiesPage() {
    const [parties, setParties] = useState<IParty[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchParties = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/parties`);
                const data = await response.json();
                setParties(data);
            } catch (err) {
                console.error('Error fetching parties:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchParties();
    }, []);

    return (
        <AdminLayout>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white">จัดการพรรคการเมือง</h1>
                    <p className="text-slate-400">จัดการข้อมูล ชื่อย่อ สี โลโก้ และหัวหน้าพรรค</p>
                </div>
                <button className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-all">
                    + เพิ่มพรรคใหม่
                </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">โลโก้</th>
                            <th className="px-6 py-4">ชื่อพรรค</th>
                            <th className="px-6 py-4">หัวหน้าพรรค</th>
                            <th className="px-6 py-4">สีประจำพรรค</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</td>
                            </tr>
                        ) : parties.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-slate-500">ไม่พบข้อมูลพรรคการเมือง</td>
                            </tr>
                        ) : (
                            parties.map((party) => (
                                <tr key={party.id} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="h-10 w-10 rounded-lg bg-white p-1 overflow-hidden border border-slate-700">
                                            {party.logoUrl ? (
                                                <img src={party.logoUrl} alt={party.nameTh} className="h-full w-full object-contain" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-400">
                                                    {party.abbreviation || party.nameTh[0]}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-200">{party.nameTh}</p>
                                        <p className="text-xs text-slate-500">{party.abbreviation || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {party.leaderName || 'ไม่ระบุข้อมูล'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: party.color }} />
                                            <span className="text-xs font-mono text-slate-500 uppercase">{party.color}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all border border-slate-700">
                                                แก้ไข
                                            </button>
                                            <button className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20">
                                                ลบ
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
