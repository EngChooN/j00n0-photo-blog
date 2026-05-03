const PROD_HOST_PATTERNS = [/\.supabase\.co$/i, /\.pooler\.supabase\.com$/i];

const SUSPECT_VARS = ['DATABASE_URL', 'DIRECT_URL', 'SUPABASE_URL'] as const;

function hostnameOf(value: string): string | null {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

export function validateEnvGuard(env: NodeJS.ProcessEnv = process.env): void {
  // eslint-disable-next-line no-console
  console.log(`[ENV GUARD] NODE_ENV=${env.NODE_ENV ?? '(unset)'}`);

  if (env.NODE_ENV === 'production') return;

  const violations: string[] = [];
  for (const name of SUSPECT_VARS) {
    const value = env[name];
    if (!value) continue;
    const host = hostnameOf(value);
    if (!host) continue;
    if (PROD_HOST_PATTERNS.some((p) => p.test(host))) {
      violations.push(`${name} → ${host}`);
    }
  }

  if (violations.length === 0) return;

  const message =
    `[ENV GUARD] Production-looking host detected in non-production env.\n` +
    `Offending: ${violations.join(', ')}\n` +
    `Local development must point at a local DB and STORAGE_DRIVER=local.\n` +
    `Refusing to start.`;
  throw new Error(message);
}
