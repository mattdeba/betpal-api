import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBetDto {
  @IsString()
  @IsOptional()
  readonly assertion?: string;
  @IsNumber()
  @IsOptional()
  readonly amount?: number;
  @IsNumber()
  @IsOptional()
  readonly target?: number;
}
