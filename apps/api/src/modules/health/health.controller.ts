import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

interface HealthStatus {
    status: 'ok' | 'degraded';
    db: boolean;
    redis: boolean;
    uptime: number;
    timestamp: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Health check — verifies DB and Redis connectivity' })
    async check(): Promise<HealthStatus> {
        const [dbOk, redisOk] = await Promise.all([
            this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
            this.redis.getJson<string>('health:ping').then(() => true).catch(() => false),
        ]);

        return {
            status: dbOk && redisOk ? 'ok' : 'degraded',
            db: dbOk,
            redis: redisOk,
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
        };
    }
}
