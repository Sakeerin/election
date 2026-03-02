import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { ElectionGateway } from '../../gateways/election.gateway';

@Module({
    controllers: [SectionController],
    providers: [SectionService, ElectionGateway],
    exports: [SectionService],
})
export class SectionModule { }
