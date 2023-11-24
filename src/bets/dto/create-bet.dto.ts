import { IsEmail } from 'class-validator';

export class CreateBetDto {
  readonly assertion: string;
  readonly amount: number;
  readonly target: number;
  @IsEmail()
  readonly creatorEmail: string;
}
