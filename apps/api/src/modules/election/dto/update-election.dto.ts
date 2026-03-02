import { PartialType } from '@nestjs/swagger';
import { CreateElectionDto } from './create-election.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateElectionDto extends PartialType(CreateElectionDto) { }

export class UpdateElectionStatusDto {
    @ApiPropertyOptional({ enum: ['DRAFT', 'ACTIVE', 'COUNTING', 'COMPLETED', 'ARCHIVED'] })
    @IsEnum(['DRAFT', 'ACTIVE', 'COUNTING', 'COMPLETED', 'ARCHIVED'] as const)
    status: string;
}
