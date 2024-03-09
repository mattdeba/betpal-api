import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly firstName: string;
  @IsString()
  readonly lastName: string;
  @IsEmail()
  readonly email: string;
  @IsNumber()
  readonly points: number;
}
