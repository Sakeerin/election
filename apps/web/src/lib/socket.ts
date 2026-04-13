'use client';

import { io, Socket } from 'socket.io-client';
import { WS_EVENTS } from '@election/shared';

let socket: Socket | null = null;
const subscribedConstituencies = new Set<number>();
const subscribedProvinces = new Set<number>();

export function getSocket(): Socket {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
    }
    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
        subscribedConstituencies.clear();
        subscribedProvinces.clear();
    }
}

export function subscribeConstituency(constituencyId: number): void {
    if (!Number.isInteger(constituencyId) || constituencyId <= 0) {
        return;
    }
    if (subscribedConstituencies.has(constituencyId)) {
        return;
    }

    const s = getSocket();
    s.emit(WS_EVENTS.SUBSCRIBE_CONSTITUENCY, { constituencyId });
    subscribedConstituencies.add(constituencyId);
}

export function subscribeProvince(provinceId: number): void {
    if (!Number.isInteger(provinceId) || provinceId <= 0) {
        return;
    }
    if (subscribedProvinces.has(provinceId)) {
        return;
    }

    const s = getSocket();
    s.emit(WS_EVENTS.SUBSCRIBE_PROVINCE, { provinceId });
    subscribedProvinces.add(provinceId);
}
