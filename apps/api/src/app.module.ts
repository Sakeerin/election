import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { PartyModule } from './modules/party/party.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { ConstituencyModule } from './modules/constituency/constituency.module';
import { VoteModule } from './modules/vote/vote.module';
import { ReferendumModule } from './modules/referendum/referendum.module';
import { SectionModule } from './modules/section/section.module';
import { SummaryModule } from './modules/summary/summary.module';
import { ElectionGateway } from './gateways/election.gateway';

@Module({
    imports: [
        // Global config
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

        // Infrastructure
        PrismaModule,
        RedisModule,

        // Feature modules
        AuthModule,
        PartyModule,
        CandidateModule,
        ConstituencyModule,
        VoteModule,
        ReferendumModule,
        SectionModule,
        SummaryModule,
    ],
    providers: [ElectionGateway],
})
export class AppModule { }
