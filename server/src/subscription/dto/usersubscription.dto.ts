import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CheckoutSubscriptionDto {
  @IsNotEmpty({ message: 'Vui lòng chọn gói ăn (packageId)' })
  @IsInt({ message: 'packageId phải là số nguyên' })
  packageId: number;

  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là chuỗi ngày hợp lệ (YYYY-MM-DD)' })
  startDate?: string;
}
