import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register with email/password' })
  signUp(@Body() dto: SignUpDto) {
    return this.auth.signUp(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto, @CurrentUser() user: User) {
    return this.auth.refresh(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: { user: { googleId: string; email: string; name?: string; avatarUrl?: string } }) {
    return this.auth.googleLogin(req.user);
  }

  @Post('password-reset/request')
  @ApiOperation({ summary: 'Request password reset email' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto);
  }

  @Post('password-reset/confirm')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@CurrentUser() user: User) {
    return this.auth.logout(user.id);
  }
}
