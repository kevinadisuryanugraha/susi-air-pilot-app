import { IsOptional, Matches } from 'class-validator';

export class GetSchedulesDto {
  @IsOptional()
  @Matches(/^\d{4}$/, { message: 'year must be a 4-digit number (YYYY)' })
  year?: string;

  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2]|[1-9])$/, { message: 'month must be between 01 and 12' })
  month?: string;
}
