import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { UploadForm } from '@/components/organisms/UploadForm';

export default function UploadPage() {
  return (
    <PageShell>
      <AdminGuard>
        <div className="pb-16">
          <SectionHeading
            eyebrow="Composition"
            title="New entry."
            description="새 사진을 매거진에 더해보세요. 업로드된 이미지는 자동으로 최적화되어 저장됩니다."
          />
        </div>
        <Hairline className="mb-16" />
        <UploadForm />
      </AdminGuard>
    </PageShell>
  );
}
