import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VoteService } from './vote.service';
import {
    UpdateConstituencyVotesDto,
    UpdatePartyListDto,
    BatchUpdateConstituencyVotesDto,
} from './dto/update-votes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Votes')
@Controller('votes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VoteController {
    constructor(private readonly voteService: VoteService) { }

    @Post('constituency')
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiOperation({ summary: 'Update constituency vote results for a single constituency' })
    updateConstituencyVotes(@Body() dto: UpdateConstituencyVotesDto) {
        return this.voteService.updateConstituencyVotes(dto);
    }

    @Post('constituency/batch')
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiOperation({
        summary: 'Batch update vote results for multiple constituencies (Editor+)',
        description: 'Updates multiple constituencies atomically. Each item is processed independently; partial failures are reported.',
    })
    batchUpdateConstituencyVotes(@Body() dto: BatchUpdateConstituencyVotesDto) {
        return this.voteService.batchUpdateConstituencyVotes(dto);
    }

    @Post('party-list')
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiOperation({ summary: 'Update party list allocation (Editor+)' })
    updatePartyListAllocation(@Body() dto: UpdatePartyListDto) {
        return this.voteService.updatePartyListAllocation(dto);
    }
}
