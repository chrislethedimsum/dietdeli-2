import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMealPackageDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên gói suất ăn không được để trống' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  caloriesPerMeal: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalMeals: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}