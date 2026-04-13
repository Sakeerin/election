import type { Metadata } from 'next';
import { Geist, Geist_Mono, Sarabun } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const sarabun = Sarabun({
    variable: '--font-sarabun',
    subsets: ['thai', 'latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'รายงานผลการเลือกตั้ง | Election Results',
    description: 'ติดตามผลการเลือกตั้งสมาชิกสภาผู้แทนราษฎรแบบเรียลไทม์',
    openGraph: {
        title: 'รายงานผลการเลือกตั้ง',
        description: 'ติดตามผลการเลือกตั้งสมาชิกสภาผู้แทนราษฎรแบบเรียลไทม์',
        type: 'website',
        locale: 'th_TH',
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="th" className={`${sarabun.variable} ${geistSans.variable} ${geistMono.variable}`}>
            <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
                {children}
            </body>
        </html>
    );
}
