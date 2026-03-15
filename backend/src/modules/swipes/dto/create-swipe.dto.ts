import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export enum SwipeDirectionDto {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class CreateSwipeDto {
  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ enum: SwipeDirectionDto })
  @IsEnum(SwipeDirectionDto)
  direction: 'LEFT' | 'RIGHT';
}
