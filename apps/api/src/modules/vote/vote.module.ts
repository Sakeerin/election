import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { ElectionGateway } from '../../gateways/election.gateway';
import { SummaryModule } from '../summary/summary.module';

@Module({
    imports: [SummaryModule],
    controllers: [VoteController],
    providers: [VoteService, ElectionGateway],
    exports: [VoteService],
})
export class VoteModule { }
