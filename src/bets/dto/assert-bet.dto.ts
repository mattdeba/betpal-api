import { IsBoolean } from 'class-validator';

export class AssertBetDto {
  @IsBoolean()
  readonly assertionCorrect: boolean;
}
