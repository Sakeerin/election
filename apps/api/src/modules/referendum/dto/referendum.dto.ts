import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReferendumDto {
    @ApiProperty()
    @IsInt()
    electionId: number;

    @ApiProperty({ example: 'ท่านเห็นชอบร่างรัฐธรรมนูญฉบับใหม่หรือไม่' })
    @IsString()
    @IsNotEmpty()
    questionTh: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionEn?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descriptionTh?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descriptionEn?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isEnabled?: boolean;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    displayOrder?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    totalEligibleVoters?: number;
}

export class UpdateReferendumDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionTh?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    questionEn?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descriptionTh?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descriptionEn?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    displayOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    totalEligibleVoters?: number;
}

export class UpdateReferendumResultDto {
    @ApiProperty()
    @IsInt()
    referendumId: number;

    @ApiProperty()
    @IsInt()
    provinceId: number;

    @ApiProperty()
    @IsInt()
    approveCount: number;

    @ApiProperty()
    @IsInt()
    disapproveCount: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    abstainCount?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    totalVoters?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    countingProgress?: number;
}

export class ToggleReferendumDto {
    @ApiProperty()
    @IsBoolean()
    isEnabled: boolean;
}
