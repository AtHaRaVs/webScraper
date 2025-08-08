import { IsString, IsUrl } from 'class-validator';

export class ScrapeRequestDto {
  @IsString()
  @IsUrl()
  url: string = '';
}
