import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateElectionDto {
    @ApiProperty({ example: 'การเลือกตั้งทั่วไป 2570' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '2027-05-14T00:00:00.000Z' })
    @IsDateString()
    electionDate: string;

    @ApiPropertyOptional({ enum: ['GENERAL', 'BY_ELECTION'], default: 'GENERAL' })
    @IsOptional()
    @IsEnum(['GENERAL', 'BY_ELECTION'] as const)
    type?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    hasReferendum?: boolean;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    totalEligibleVoters?: number;
}
