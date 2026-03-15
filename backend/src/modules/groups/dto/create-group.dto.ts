import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, Min, Max } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Foodie Squad' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Match when this % of members like (100 = all)', default: 100 })
  @IsOptional()
  @Min(50)
  @Max(100)
  matchThreshold?: number;
}
