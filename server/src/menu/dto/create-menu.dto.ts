import { Type } from 'class-transformer';
import { IsDateString, IsInt } from 'class-validator';

export class CreateMenuDto {
  @Type(() => Number)
  @IsInt()
  dishId: number;

  @IsDateString()
  date: string;
}
