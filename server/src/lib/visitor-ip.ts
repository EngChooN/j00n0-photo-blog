import { createHash } from 'node:crypto';
import type { Request } from 'express';

const SALT = process.env.VISITOR_IP_SALT ?? 'change-me-in-production';

export function getVisitorIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? '0.0.0.0';
}

export function hashVisitorIp(ip: string): string {
  return createHash('sha256').update(`${SALT}:${ip}`).digest('hex');
}

export function getVisitorIpHash(req: Request): string {
  return hashVisitorIp(getVisitorIp(req));
}
