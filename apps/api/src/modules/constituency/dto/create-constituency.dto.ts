import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConstituencyDto {
    @ApiProperty()
    @IsInt()
    electionId: number;

    @ApiProperty()
    @IsInt()
    provinceId: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    constituencyNumber: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    eligibleVoters?: number;
}
