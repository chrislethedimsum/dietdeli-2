import { IsOptional, IsString } from 'class-validator';

export class UpdateDishDto {
  @IsString()
  @IsOptional()
  readonly nameVi?: string;

  @IsString()
  @IsOptional()
  readonly nameEn?: string;

  @IsString()
  @IsOptional()
  readonly descriptionVi?: string;

  @IsString()
  @IsOptional()
  readonly descriptionEn?: string;
}
