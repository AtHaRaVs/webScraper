import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { isAxiosError } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

interface Link {
  url: string;
  text: string;
}

interface Image {
  src: string;
  alt: string;
}

interface ScrapedData {
  url: string;
  timestamp: string;
  title: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  paragraphs: string[];
  links: Link[];
  images: Image[];
  meta: {
    description: string;
    keywords: string;
    author: string;
  };
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeAndSave(
    url: string,
  ): Promise<{ message: string; filePath: string; dataExtracted: any }> {
    try {
      this.logger.log(`Starting scrape operation for the url ${url}`);

      const response = await axios.get<string>(url, {
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      const extractedData = this.extractData($, url);

      const filePath = await this.saveDataToFile(extractedData);

      this.logger.log(
        `Scrape operation completed successfully. Data saved to: ${filePath}`,
      );

      return {
        message: 'Data scraped and saved successfully',
        filePath,
        dataExtracted: extractedData,
      };
    } catch (error: unknown) {
      this.logger.error(
        'Error during scrape operation',
        error instanceof Error ? error.stack : String(error),
      );

      if (isAxiosError(error)) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new BadRequestException('Unable to reach the specified URL');
        }

        if (error.response) {
          throw new BadRequestException(
            `HTTP ${error.response.status}: ${error.response.statusText}`,
          );
        }
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(
          `Unexpected error during scraping: ${error.message}`,
        );
      }

      throw new InternalServerErrorException(
        'An unknown error occurred during scraping',
      );
    }
  }

  private extractData($: cheerio.CheerioAPI, url: string): ScrapedData {
    const data: ScrapedData = {
      url,
      timestamp: new Date().toISOString(),
      title: $('title').text().trim() || 'No title found',
      headings: {
        h1: [],
        h2: [],
        h3: [],
      },
      paragraphs: [],
      links: [],
      images: [],
      meta: {
        description:
          $('meta[name="description"]').attr('content') ||
          'No description found',
        keywords:
          $('meta[name="keywords"]').attr('content') || 'No keywords found',
        author: $('meta[name="author"]').attr('content') || 'No author found',
      },
    };

    $('h1').each((_, element) => {
      const text = $(element).text().trim();
      if (text) data.headings.h1.push(text);
    });

    $('h2').each((_, element) => {
      const text = $(element).text().trim();
      if (text) data.headings.h2.push(text);
    });

    $('h3').each((_, element) => {
      const text = $(element).text().trim();
      if (text) data.headings.h3.push(text);
    });

    $('p')
      .slice(0, 10)
      .each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 20) {
          data.paragraphs.push(text);
        }
      });

    $('a[href]')
      .slice(0, 20)
      .each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        if (href && text) {
          data.links.push({
            url: this.resolveUrl(href, url),
            text: text,
          });
        }
      });

    $('img[src]')
      .slice(0, 10)
      .each((_, element) => {
        const src = $(element).attr('src');
        const alt = $(element).attr('alt');
        if (src) {
          data.images.push({
            src: this.resolveUrl(src, url),
            alt: alt || 'No alt text',
          });
        }
      });

    return data;
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      return new URL(href, baseUrl).href;
    } catch (error) {
      return href;
    }
  }

  private async saveDataToFile(data: any): Promise<string> {
    const fileName = `scraped-data-${Date.now()}.json`;
    const filePath = path.join(process.cwd(), fileName);

    const jsonData = JSON.stringify(data, null, 2);

    await fs.promises.writeFile(filePath, jsonData, 'utf8');

    return filePath;
  }

  async getScrapedFiles(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(process.cwd());
      return files.filter(
        (file) => file.startsWith('scraped-data-') && file.endsWith('.json'),
      );
    } catch (error: any) {
      this.logger.error(`Error reading scraped files: ${error.message}`);
      return [];
    }
  }
}
