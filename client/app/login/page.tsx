import { Suspense } from 'react';
import { CenteredShell } from '@/components/templates/CenteredShell';
import { LoginForm } from '@/components/organisms/LoginForm';

export default function LoginPage() {
  return (
    <CenteredShell>
      <div className="space-y-12">
        <header className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted">
            Editorial Access
          </p>
          <h1 className="display text-5xl leading-[0.95]">Sign In</h1>
          <p className="text-sm leading-relaxed text-muted">
            관리자만 사진과 글을 게시할 수 있어요.
          </p>
        </header>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </CenteredShell>
  );
}
