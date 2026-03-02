import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
    @ApiProperty()
    @IsInt()
    partyId: number;

    @ApiProperty()
    @IsInt()
    constituencyId: number;

    @ApiProperty({ example: 'สมชาย ใจดี' })
    @IsString()
    @IsNotEmpty()
    nameTh: string;

    @ApiPropertyOptional({ example: 'Somchai Jaidee' })
    @IsOptional()
    @IsString()
    nameEn?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    candidateNumber?: number;
}
