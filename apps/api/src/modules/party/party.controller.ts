import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Get all parties' })
    findAll() {
        return this.partyService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get party by ID with party list candidates' })
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.partyService.findById(id);
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
