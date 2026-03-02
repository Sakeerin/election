import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConstituencyService } from './constituency.service';
import { CreateConstituencyDto } from './dto/create-constituency.dto';
import { UpdateConstituencyDto } from './dto/update-constituency.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Constituencies')
@Controller('constituencies')
export class ConstituencyController {
    constructor(private readonly constituencyService: ConstituencyService) { }

    @Get()
    @ApiOperation({ summary: 'Get constituencies by election (optionally filter by province)' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    @ApiQuery({ name: 'provinceId', required: false, type: Number })
    findByElection(
        @Query('electionId', ParseIntPipe) electionId: number,
        @Query('provinceId') provinceId?: string,
    ) {
        return this.constituencyService.findByElection(
            electionId,
            provinceId ? parseInt(provinceId, 10) : undefined,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get constituency by ID with candidates and results' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.constituencyService.findById(id);
    }

    @Get(':id/results')
    @ApiOperation({ summary: 'Get constituency results' })
    getResults(@Param('id', ParseIntPipe) id: number) {
        return this.constituencyService.getResults(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new constituency (Admin only)' })
    create(@Body() dto: CreateConstituencyDto) {
        return this.constituencyService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a constituency (Editor+)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConstituencyDto) {
        return this.constituencyService.update(id, dto);
    }
}
