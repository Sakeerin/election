import { PartialType } from '@nestjs/swagger';
import { CreateConstituencyDto } from './create-constituency.dto';
import { IsOptional, IsInt, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConstituencyDto extends PartialType(CreateConstituencyDto) {
    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    totalVoters?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    goodBallots?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    badBallots?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    noVoteBallots?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    countingProgress?: number;

    @ApiPropertyOptional({ enum: ['PENDING', 'COUNTING', 'COMPLETED'] })
    @IsOptional()
    @IsEnum(['PENDING', 'COUNTING', 'COMPLETED'] as const)
    status?: string;
}
