import { Injectable, TooManyRequestsException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AttemptRecord = {
  failureCount: number;
  firstFailureAt: number;
  blockedUntil: number | null;
};

type AttemptScope = 'ip' | 'email';

@Injectable()
export class LoginAttemptLimiterService {
  private readonly ipRecords = new Map<string, AttemptRecord>();
  private readonly emailRecords = new Map<string, AttemptRecord>();
  private readonly ipMaxAttempts: number;
  private readonly emailMaxAttempts: number;
  private readonly windowMs: number;
  private readonly blockMs: number;

  constructor(private readonly configService: ConfigService) {
    this.ipMaxAttempts = this.getPositiveInteger('app.security.loginIpMaxAttempts', 20);
    this.emailMaxAttempts = this.getPositiveInteger('app.security.loginEmailMaxAttempts', 5);
    this.windowMs = this.getPositiveInteger('app.security.loginWindowMs', 15 * 60 * 1000);
    this.blockMs = this.getPositiveInteger('app.security.loginBlockMs', 15 * 60 * 1000);
  }

  ensureAllowed(ipAddress: string, email: string): void {
    this.ensureScopeAllowed(this.ipRecords, ipAddress, 'ip');
    this.ensureScopeAllowed(this.emailRecords, email, 'email');
  }

  registerFailure(ipAddress: string, email: string): void {
    this.registerScopeFailure(this.ipRecords, ipAddress, this.ipMaxAttempts);
    this.registerScopeFailure(this.emailRecords, email, this.emailMaxAttempts);
  }

  clearFailures(ipAddress: string, email: string): void {
    this.ipRecords.delete(ipAddress);
    this.emailRecords.delete(email);
  }

  private ensureScopeAllowed(records: Map<string, AttemptRecord>, key: string, scope: AttemptScope): void {
    const record = records.get(key);

    if (!record) {
      return;
    }

    const now = Date.now();
    this.cleanupExpiredRecord(records, key, record, now);

    const currentRecord = records.get(key);

    if (!currentRecord || !currentRecord.blockedUntil || currentRecord.blockedUntil <= now) {
      return;
    }

    throw new TooManyRequestsException({
      statusCode: 429,
      message: 'Too many login attempts. Try again later.',
      retryAfterSeconds: Math.max(1, Math.ceil((currentRecord.blockedUntil - now) / 1000)),
      scope,
    });
  }

  private registerScopeFailure(
    records: Map<string, AttemptRecord>,
    key: string,
    maxAttempts: number,
  ): void {
    const now = Date.now();
    const currentRecord = records.get(key);

    if (!currentRecord || now - currentRecord.firstFailureAt > this.windowMs) {
      records.set(key, {
        failureCount: 1,
        firstFailureAt: now,
        blockedUntil: null,
      });
      return;
    }

    const failureCount = currentRecord.failureCount + 1;
    const blockedUntil = failureCount >= maxAttempts ? now + this.blockMs : currentRecord.blockedUntil;

    records.set(key, {
      failureCount,
      firstFailureAt: currentRecord.firstFailureAt,
      blockedUntil,
    });
  }

  private cleanupExpiredRecord(
    records: Map<string, AttemptRecord>,
    key: string,
    record: AttemptRecord,
    now: number,
  ): void {
    const blockExpired = record.blockedUntil !== null && record.blockedUntil <= now;
    const windowExpired = now - record.firstFailureAt > this.windowMs;

    if (blockExpired || windowExpired) {
      records.delete(key);
    }
  }

  private getPositiveInteger(configPath: string, fallbackValue: number): number {
    const rawValue = this.configService.get<string | number | undefined>(configPath);

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return fallbackValue;
    }

    const numericValue = Number(rawValue);
    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : fallbackValue;
  }
}
