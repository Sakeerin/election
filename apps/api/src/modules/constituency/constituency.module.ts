import { Module } from '@nestjs/common';
import { ConstituencyService } from './constituency.service';
import { ConstituencyController } from './constituency.controller';
import { ElectionGateway } from '../../gateways/election.gateway';
import { SummaryModule } from '../summary/summary.module';

@Module({
    imports: [SummaryModule],
    controllers: [ConstituencyController],
    providers: [ConstituencyService, ElectionGateway],
    exports: [ConstituencyService],
})
export class ConstituencyModule { }
