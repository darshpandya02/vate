import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  newPassword: string;
}
