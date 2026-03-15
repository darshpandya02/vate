import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinGroupDto {
  @ApiProperty({ description: 'Invite code (e.g. ABC123XY)' })
  @IsString()
  @Length(6, 12)
  inviteCode: string;
}
