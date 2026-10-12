import { IsInt, IsArray, ValidateNested, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VoteEntryDto {
    @ApiProperty({ description: 'Candidate ID' })
    @IsInt()
    @Min(1)
    candidateId: number;

    @ApiProperty({ description: 'Raw vote count (≥ 0)', minimum: 0 })
    @IsInt()
    @Min(0)
    @Max(10_000_000)
    voteCount: number;
}

export class UpdateConstituencyVotesDto {
    @ApiProperty({ description: 'Constituency ID' })
    @IsInt()
    @Min(1)
    constituencyId: number;

    @ApiProperty({ type: [VoteEntryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VoteEntryDto)
    votes: VoteEntryDto[];

    @ApiPropertyOptional({ description: 'Total registered voters', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    totalVoters?: number;

    @ApiPropertyOptional({ description: 'Valid ballots cast', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    goodBallots?: number;

    @ApiPropertyOptional({ description: 'Spoiled ballots', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    badBallots?: number;

    @ApiPropertyOptional({ description: 'No-vote ballots', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    noVoteBallots?: number;

    @ApiPropertyOptional({ description: 'Counting progress percentage (0–100)', minimum: 0, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    countingProgress?: number;
}

export class UpdatePartyListDto {
    @ApiProperty()
    @IsInt()
    @Min(1)
    electionId: number;

    @ApiProperty()
    @IsInt()
    @Min(1)
    partyId: number;

    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    totalPartyListVotes: number;

    @ApiProperty({ minimum: 0 })
    @IsInt()
    @Min(0)
    allocatedSeats: number;
}

export class BatchUpdateConstituencyVotesDto {
    @ApiProperty({ type: [UpdateConstituencyVotesDto], description: 'Array of constituency vote updates' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateConstituencyVotesDto)
    updates: UpdateConstituencyVotesDto[];
}
