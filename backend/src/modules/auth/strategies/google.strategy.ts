import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  displayName: string;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');
    const options = clientID && clientSecret && callbackURL
      ? { clientID, clientSecret, callbackURL, scope: ['email', 'profile'] as const, passReqToCallback: false }
      : { clientID: 'disabled', clientSecret: 'disabled', callbackURL: 'http://localhost:3000/callback', passReqToCallback: false as const };
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;
    done(null, {
      googleId: profile.id,
      email: email || '',
      name,
      avatarUrl,
    });
  }
}
