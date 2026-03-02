import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { UpdateSectionDto, ToggleSectionDto, ReorderSectionsDto } from './dto/section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Sections')
@Controller('sections')
export class SectionController {
    constructor(private readonly sectionService: SectionService) { }

    @Get()
    @ApiOperation({ summary: 'Get election sections' })
    @ApiQuery({ name: 'electionId', required: true, type: Number })
    findByElection(@Query('electionId', ParseIntPipe) electionId: number) {
        return this.sectionService.findByElection(electionId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a section (Admin only)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
        return this.sectionService.update(id, dto);
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle section visibility (Admin only, broadcasts via WebSocket)' })
    toggle(@Param('id', ParseIntPipe) id: number, @Body() dto: ToggleSectionDto) {
        return this.sectionService.toggle(id, dto);
    }

    @Post('reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder sections (Admin only)' })
    reorder(@Body() dto: ReorderSectionsDto) {
        return this.sectionService.reorder(dto);
    }
}
