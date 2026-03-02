import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartyDto {
    @ApiProperty({ example: 'เพื่อไทย' })
    @IsString()
    @IsNotEmpty()
    nameTh: string;

    @ApiPropertyOptional({ example: 'Pheu Thai' })
    @IsOptional()
    @IsString()
    nameEn?: string;

    @ApiPropertyOptional({ example: 'PT' })
    @IsOptional()
    @IsString()
    abbreviation?: string;

    @ApiPropertyOptional({ example: '#E0301E' })
    @IsOptional()
    @IsString()
    color?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    leaderName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    leaderImageUrl?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    partyNumber?: number;
}
