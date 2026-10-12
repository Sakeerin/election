import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '@election/shared/src/constants';
import type {
    WsVoteUpdated,
    WsPartyUpdated,
    WsReferendumUpdated,
    WsReferendumToggled,
    WsSectionToggled,
    WsCountingProgress,
} from '@election/shared';

@WebSocketGateway({
    cors: {
        // Restrict origins to the configured allowlist (never wildcard in production)
        origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
            .split(',')
            .map((o) => o.trim()),
        credentials: true,
    },
    namespace: '/',
})
export class ElectionGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('ElectionGateway');

    // Injecting ConfigService requires the gateway to be a proper NestJS provider
    constructor(private readonly configService: ConfigService) { }

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage(WS_EVENTS.SUBSCRIBE_CONSTITUENCY)
    handleSubscribeConstituency(client: Socket, payload: { constituencyId: number }) {
        const id = Number(payload?.constituencyId);
        if (!Number.isInteger(id) || id <= 0) {
            client.emit('error', { message: 'Invalid constituencyId' });
            return;
        }
        const room = `constituency:${id}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage(WS_EVENTS.SUBSCRIBE_PROVINCE)
    handleSubscribeProvince(client: Socket, payload: { provinceId: number }) {
        const id = Number(payload?.provinceId);
        if (!Number.isInteger(id) || id <= 0) {
            client.emit('error', { message: 'Invalid provinceId' });
            return;
        }
        const room = `province:${id}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);
    }

    // ── Broadcast helpers (called from services after successful DB commit) ──

    broadcastVoteUpdated(data: WsVoteUpdated) {
        this.server.emit(WS_EVENTS.VOTE_UPDATED, data);
        this.server
            .to(`constituency:${data.constituencyId}`)
            .emit(WS_EVENTS.VOTE_UPDATED, data);
    }

    broadcastPartyUpdated(data: WsPartyUpdated) {
        this.server.emit(WS_EVENTS.PARTY_UPDATED, data);
    }

    broadcastReferendumUpdated(data: WsReferendumUpdated) {
        this.server.emit(WS_EVENTS.REFERENDUM_UPDATED, data);
    }

    broadcastReferendumToggled(data: WsReferendumToggled) {
        this.server.emit(WS_EVENTS.REFERENDUM_TOGGLED, data);
    }

    broadcastSectionToggled(data: WsSectionToggled) {
        this.server.emit(WS_EVENTS.SECTION_TOGGLED, data);
    }

    broadcastCountingProgress(data: WsCountingProgress) {
        this.server.emit(WS_EVENTS.COUNTING_PROGRESS, data);
    }
}
