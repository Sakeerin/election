import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SectionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    titleTh?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    titleEn?: string;

    @ApiPropertyOptional({ enum: SectionType })
    @IsOptional()
    @IsEnum(SectionType)
    sectionType?: SectionType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    displayOrder?: number;

    @ApiPropertyOptional()
    @IsOptional()
    config?: any;
}

export class ToggleSectionDto {
    @ApiProperty()
    @IsBoolean()
    isEnabled: boolean;
}

export class ReorderItemDto {
    @ApiProperty()
    @IsInt()
    id: number;

    @ApiProperty()
    @IsInt()
    displayOrder: number;
}

export class ReorderSectionsDto {
    @ApiProperty()
    @IsInt()
    electionId: number;

    @ApiProperty({ type: [ReorderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items: ReorderItemDto[];
}
