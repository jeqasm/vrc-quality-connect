import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordHashService {
  hash(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const digest = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${digest}`;
  }

  verify(password: string, hashedValue: string): boolean {
    const [salt, currentDigest] = hashedValue.split(':');

    if (!salt || !currentDigest) {
      return false;
    }

    const nextDigest = scryptSync(password, salt, 64);
    const currentDigestBuffer = Buffer.from(currentDigest, 'hex');

    if (currentDigestBuffer.length !== nextDigest.length) {
      return false;
    }

    return timingSafeEqual(currentDigestBuffer, nextDigest);
  }
}
