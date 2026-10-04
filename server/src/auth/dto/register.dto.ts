import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;

  // Chỉ số cơ thể
  @IsOptional()
  gender?: string;

  @IsOptional()
  height?: number;

  @IsOptional()
  weight?: number;

  @IsOptional()
  goal?: string;

  // 👉 Thông tin gói ăn khách chọn từ Báo giá
  @IsOptional()
  @IsString()
  packageType?: string; // 'ngay' | 'tuan' | 'thang'

  @IsOptional()
  @IsString()
  mealOption?: string; // '1_meal' | '2_meals'

  @IsOptional()
  calories?: number; // 400 | 600 | 800

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
