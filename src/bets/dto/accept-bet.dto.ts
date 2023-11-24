import { IsEmail } from 'class-validator';

export class AcceptBetDto {
  @IsEmail()
  readonly acceptorEmail: string;
}
