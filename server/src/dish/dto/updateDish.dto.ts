import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './createDish.dto.js';

export class UpdateDishDto extends PartialType(CreateDishDto) {}
