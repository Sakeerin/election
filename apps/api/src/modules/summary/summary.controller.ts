import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SummaryService } from './summary.service';

@ApiTags('Summary')
@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Get election overview (cached, high-traffic endpoint)' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    getOverview(@Query('electionId', ParseIntPipe) electionId: number) {
        return this.summaryService.getOverview(electionId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get party leaderboard (cached)' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    getLeaderboard(@Query('electionId', ParseIntPipe) electionId: number) {
        return this.summaryService.getPartyLeaderboard(electionId);
    }

    @Get('progress')
    @ApiOperation({ summary: 'Get counting progress' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    getProgress(@Query('electionId', ParseIntPipe) electionId: number) {
        return this.summaryService.getCountingProgress(electionId);
    }

    @Get('province/:provinceId')
    @ApiOperation({ summary: 'Get results by province' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    getProvinceResults(
        @Param('provinceId', ParseIntPipe) provinceId: number,
        @Query('electionId', ParseIntPipe) electionId: number,
    ) {
        return this.summaryService.getProvinceResults(electionId, provinceId);
    }
}
