import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReferendumService } from './referendum.service';
import {
    CreateReferendumDto,
    UpdateReferendumDto,
    UpdateReferendumResultDto,
    ToggleReferendumDto,
} from './dto/referendum.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Referendums')
@Controller('referendums')
export class ReferendumController {
    constructor(private readonly referendumService: ReferendumService) { }

    @Get()
    @ApiOperation({ summary: 'Get referendums by election' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    findByElection(@Query('electionId', ParseIntPipe) electionId: number) {
        return this.referendumService.findByElection(electionId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get referendum by ID with province results' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.referendumService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new referendum (Admin only)' })
    create(@Body() dto: CreateReferendumDto) {
        return this.referendumService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update referendum (Admin only)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReferendumDto) {
        return this.referendumService.update(id, dto);
    }

    @Post(':id/results')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit referendum results by province (Editor+)' })
    updateResults(@Body() dto: UpdateReferendumResultDto) {
        return this.referendumService.updateResults(dto);
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle referendum visibility (Admin only)' })
    toggle(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleReferendumDto) {
        return this.referendumService.toggle(id, dto);
    }
}
