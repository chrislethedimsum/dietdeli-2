import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CheckoutSubscriptionDto {
  @IsNotEmpty({ message: 'Vui lòng chọn gói ăn (packageId)' })
  @IsInt({ message: 'packageId phải là số nguyên' })
  packageId: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'startDate phải là chuỗi ngày hợp lệ (YYYY-MM-DD)' },
  )
  startDate?: string;

  @IsOptional()
  @IsString()
  userNote?: string;
  @IsOptional()
  @IsString()
  planShippingAddress?: string;
  @IsOptional()
  @IsString()
  planPhone?: string;
}

export class UpdateSubscriptionInfoDto {
  @IsOptional()
  @IsString()
  planShippingAddress?: string;

  @IsOptional()
  @IsString()
  planPhone?: string;

  @IsOptional()
  @IsString()
  userNote?: string;
}
