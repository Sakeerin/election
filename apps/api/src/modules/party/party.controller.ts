import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PartyService } from './party.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Parties')
@Controller('parties')
export class PartyController {
    constructor(private readonly partyService: PartyService) { }

    @Get()
    @ApiOperation({ summary: 'Get paginated list of parties' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.partyService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get party by ID with party list candidates' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.partyService.findById(id);
    }

    @Get(':id/detail')
    @ApiOperation({ summary: 'Get full party details with seats and wins' })
    @ApiQuery({ name: 'electionId', required: false, type: Number })
    getPartyDetail(
        @Param('id', ParseIntPipe) id: number,
        @Query('electionId') electionId?: string,
    ) {
        return this.partyService.getPartyDetail(id, electionId ? parseInt(electionId, 10) : undefined);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new party (Admin only)' })
    create(@Body() dto: CreatePartyDto) {
        return this.partyService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a party (Admin only)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartyDto) {
        return this.partyService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a party (Admin only)' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.partyService.delete(id);
    }
}
