import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty({
    message: 'Tên món ăn (tiếng Việt) không được để trống',
  })
  readonly nameVi: string;

  @IsString()
  @IsNotEmpty({
    message: 'Tên món ăn (tiếng Anh) không được để trống',
  })
  readonly nameEn: string;

  @IsString()
  @IsOptional()
  readonly descriptionVi?: string;

  @IsString()
  @IsOptional()
  readonly descriptionEn?: string;
}
