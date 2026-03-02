import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VoteService } from './vote.service';
import { UpdateConstituencyVotesDto, UpdatePartyListDto } from './dto/update-votes.dto';
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
    @ApiOperation({ summary: 'Submit/update constituency vote results (Editor+)' })
    updateConstituencyVotes(@Body() dto: UpdateConstituencyVotesDto) {
        return this.voteService.updateConstituencyVotes(dto);
    }

    @Post('party-list')
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiOperation({ summary: 'Submit/update party list allocation (Editor+)' })
    updatePartyListAllocation(@Body() dto: UpdatePartyListDto) {
        return this.voteService.updatePartyListAllocation(dto);
    }
}
