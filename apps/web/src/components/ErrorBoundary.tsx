'use client';

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Catches rendering errors in the subtree and shows a friendly fallback UI
 * instead of crashing the entire page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, message: '' });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center">
                    <p className="text-4xl mb-4">⚠️</p>
                    <h2 className="text-xl font-black text-white mb-2">เกิดข้อผิดพลาดในส่วนนี้</h2>
                    <p className="text-sm text-slate-400 mb-6 max-w-sm">
                        {this.state.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองรีเฟรชหน้านี้'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="rounded-xl bg-slate-700 px-6 py-2 text-sm font-bold text-white hover:bg-slate-600 transition-all"
                    >
                        ลองอีกครั้ง
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
