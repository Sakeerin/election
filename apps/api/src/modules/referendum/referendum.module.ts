import { Module } from '@nestjs/common';
import { ReferendumService } from './referendum.service';
import { ReferendumController } from './referendum.controller';
import { ElectionGateway } from '../../gateways/election.gateway';

@Module({
    controllers: [ReferendumController],
    providers: [ReferendumService, ElectionGateway],
    exports: [ReferendumService],
})
export class ReferendumModule { }
