import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScraperService } from './scraper.service.js';
import { ScrapeRequestDto } from './dto/scrape-request.dto.js';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('scrape')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async scrapeWebpage(@Body() scrapeRequestDto: ScrapeRequestDto) {
    return await this.scraperService.scrapeAndSave(scrapeRequestDto.url);
  }

  @Get('files')
  async getScrapedFiles() {
    const files = await this.scraperService.getScrapedFiles();
    return {
      message: 'scraped files retrieved successfully',
      files,
      count: files.length,
    };
  }

  @Get('hello')
  healthCheck() {
    return {
      status: 'ok',
      message: 'scraper service is running',
      timeStamp: new Date().toISOString(),
    };
  }
}
