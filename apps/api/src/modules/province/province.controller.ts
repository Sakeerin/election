import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProvinceService } from './province.service';

@ApiTags('Provinces')
@Controller('provinces')
export class ProvinceController {
    constructor(private readonly provinceService: ProvinceService) { }

    @Get()
    @ApiOperation({ summary: 'Get provinces (optionally only those with constituencies in an election)' })
    @ApiQuery({ name: 'electionId', required: false, type: Number })
    findAll(@Query('electionId', new ParseIntPipe({ optional: true })) electionId?: number) {
        return this.provinceService.findAll(electionId);
    }
}
