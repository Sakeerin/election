import { IsInt, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VoteEntryDto {
    @ApiProperty()
    @IsInt()
    candidateId: number;

    @ApiProperty()
    @IsInt()
    voteCount: number;
}

export class UpdateConstituencyVotesDto {
    @ApiProperty()
    @IsInt()
    constituencyId: number;

    @ApiProperty({ type: [VoteEntryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VoteEntryDto)
    votes: VoteEntryDto[];

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
}

export class UpdatePartyListDto {
    @ApiProperty()
    @IsInt()
    electionId: number;

    @ApiProperty()
    @IsInt()
    partyId: number;

    @ApiProperty()
    @IsInt()
    totalPartyListVotes: number;

    @ApiProperty()
    @IsInt()
    allocatedSeats: number;
}
