import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { ProjectForm } from '@/components/organisms/ProjectForm';

export default function NewProjectPage() {
  return (
    <PageShell>
      <AdminGuard>
        <div className="pb-16">
          <SectionHeading
            eyebrow="Composition"
            title="New project."
            description="여러 사진을 하나의 흐름으로 묶어 프로젝트를 만들어보세요."
          />
        </div>
        <Hairline className="mb-16" />
        <ProjectForm mode="create" />
      </AdminGuard>
    </PageShell>
  );
}
