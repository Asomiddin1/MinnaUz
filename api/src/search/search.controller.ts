import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Universal Qidiruv (Global Search)')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary:
      'Platformadagi barcha maʼlumotlar (kurslar, darslar, lugʻat, kanji, testlar) boʻyicha qidirish',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Qidiruv soʻzi yoki ibora',
    example: 'nihon',
  })
  async globalSearch(@Query('q') q?: string) {
    return this.searchService.globalSearch(q || '');
  }
}
