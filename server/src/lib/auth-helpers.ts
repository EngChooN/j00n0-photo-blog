import type { Request } from 'express';

// Single point of truth for owner-gated actions (post create/edit/delete,
// project visibility unmasking). When the User model lands with an `isOwner`
// flag, only this function changes — call sites stay the same.
export function isBlogOwner(req: Request): boolean {
  return (req.user as { role?: string } | undefined)?.role === 'admin';
}
