import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  homeTeam: string;

  @IsNotEmpty()
  @IsString()
  awayTeam: string;

  @IsNotEmpty()
  @IsDateString()
  dateTimeUTC: string;

  @IsNotEmpty()
  @IsBoolean()
  isClosed: boolean;

  @IsOptional()
  @IsNumber()
  homeTeamScore: number;

  @IsOptional()
  @IsNumber()
  awayTeamScore: number;

  @IsOptional()
  @IsNumber()
  gameId: number;

  @IsOptional()
  @IsString()
  gameStatus: string;

  constructor() {
    this.isClosed = false;
    this.homeTeamScore = null;
    this.awayTeamScore = null;
  }
}
