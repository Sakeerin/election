import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidateController {
    constructor(private readonly candidateService: CandidateService) { }

    @Get()
    @ApiOperation({ summary: 'Get candidates by constituency' })
    @ApiQuery({ name: 'constituencyId', required: true, type: Number })
    findByConstituency(@Query('constituencyId', ParseIntPipe) constituencyId: number) {
        return this.candidateService.findByConstituency(constituencyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get candidate by ID' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.candidateService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new candidate (Editor+)' })
    create(@Body() dto: CreateCandidateDto) {
        return this.candidateService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a candidate (Editor+)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCandidateDto) {
        return this.candidateService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a candidate (Admin only)' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.candidateService.delete(id);
    }
}
