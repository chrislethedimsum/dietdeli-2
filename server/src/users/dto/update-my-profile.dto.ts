
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  weight?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  goal?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  activityLevel?: string | null;
}
