import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateLogbookDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be formatted as YYYY-MM-DD' })
  date!: string;

  @IsString()
  @IsNotEmpty({ message: 'flightNumber is required' })
  flightNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'aircraft is required' })
  aircraft!: string;

  @IsString()
  @IsNotEmpty({ message: 'origin airport code is required' })
  origin!: string;

  @IsString()
  @IsNotEmpty({ message: 'destination airport code is required' })
  destination!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'offBlock must be formatted as HH:mm' })
  offBlock!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'onBlock must be formatted as HH:mm' })
  onBlock!: string;

  @IsNumber()
  @Min(0.1, { message: 'flightHours must be greater than 0' })
  flightHours!: number;

  @IsNumber()
  @Min(1, { message: 'landings count must be at least 1' })
  landings!: number;

  @IsString()
  @IsOptional()
  pilotRole?: 'PIC' | 'SIC' = 'PIC';

  @IsString()
  @IsOptional()
  remarks?: string;
}
