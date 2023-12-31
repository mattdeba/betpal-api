import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateBetDto {
  @IsString()
  readonly assertion: string;
  @IsNumber()
  readonly amount: number;
  @IsNumber()
  readonly target: number;
  @IsEmail()
  readonly creatorEmail: string;
  @IsNumber()
  readonly gameId: number;
  @IsBoolean()
  readonly homeTeamWinner: boolean;
}
