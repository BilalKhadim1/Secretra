import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';
const ACCESS_TOKEN_EXPIRY = '7d'; // Typical for web apps, might want longer for mobile
const REFRESH_TOKEN_EXPIRY = '30d';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  /**
   * Hashes a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password with a hashed password
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  static signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifies a Google ID Token
   */
  static async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) return null;

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Google verification error:', error);
      return null;
    }
  }

  /**
   * Verifies an Apple Identity Token
   */
  static async verifyAppleToken(identityToken: string) {
    try {
      const { sub, email } = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
      });

      return {
        sub,
        email,
      };
    } catch (error) {
      console.error('Apple verification error:', error);
      return null;
    }
  }
}
