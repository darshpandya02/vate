import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray, IsString, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  searchRadiusKm?: number;

  @ApiPropertyOptional({ description: '1-4 scale' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priceRangeMin?: number;

  @ApiPropertyOptional({ description: '1-4 scale' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priceRangeMax?: number;

  @ApiPropertyOptional({ example: ['VEGETARIAN', 'VEGAN'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @ApiPropertyOptional({ example: ['Italian', 'Japanese'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisinePreferences?: string[];
}
