import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealShift } from '@prisma/client';

export class OrderItemDto {
  @IsNotEmpty({ message: 'Vui lòng chọn món ăn' })
  @IsInt()
  dishId: number;

  @IsNotEmpty({ message: 'Số lượng món phải lớn hơn 0' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class BookMealDto {
  @IsNotEmpty({ message: 'Vui lòng chọn ngày nhận món' })
  @IsDateString(
    {},
    { message: 'deliveryDate phải là chuỗi ngày hợp lệ (YYYY-MM-DD)' },
  )
  deliveryDate: string;

  @IsNotEmpty({ message: 'Vui lòng chọn ca ăn (LUNCH hoặc DINNER)' })
  @IsEnum(MealShift, { message: 'mealShift phải là LUNCH hoặc DINNER' })
  mealShift: MealShift;

  @IsNotEmpty({ message: 'Vui lòng nhập số bữa ăn cần trừ' })
  @IsInt()
  @Min(1)
  totalMealsToDeduct: number;

  @IsArray({ message: 'Danh sách món ăn phải là một mảng' })
  @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất 1 món ăn' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingNote?: string;
}
