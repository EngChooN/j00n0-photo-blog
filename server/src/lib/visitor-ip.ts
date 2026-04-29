import { createHash, randomBytes } from 'node:crypto';
import type { Request } from 'express';

const SALT = process.env.VISITOR_IP_SALT ?? 'change-me-in-production';

export function getVisitorIp(req: Request): string | null {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? null;
}

export function hashVisitorIp(ip: string): string {
  return createHash('sha256').update(`${SALT}:${ip}`).digest('hex');
}

export function getVisitorIpHash(req: Request): string {
  const ip = getVisitorIp(req);
  if (ip) return hashVisitorIp(ip);
  // No identifiable IP — return a per-request random hash so this visitor
  // can't masquerade as another anonymous fallback caller.
  return `anon:${randomBytes(16).toString('hex')}`;
}
