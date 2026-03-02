import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto, UpdateElectionStatusDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Elections')
@Controller('elections')
export class ElectionController {
    constructor(private readonly electionService: ElectionService) { }

    @Get()
    @ApiOperation({ summary: 'Get all elections' })
    findAll() {
        return this.electionService.findAll();
    }

    @Get('active')
    @ApiOperation({ summary: 'Get the currently active election' })
    findActive() {
        return this.electionService.findActive();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get election by ID' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.electionService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new election (Admin only)' })
    create(@Body() dto: CreateElectionDto) {
        return this.electionService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an election (Admin only)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateElectionDto) {
        return this.electionService.update(id, dto);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update election status (Admin only)' })
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateElectionStatusDto) {
        return this.electionService.updateStatus(id, dto);
    }
}
