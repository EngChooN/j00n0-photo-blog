import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { ProjectForm } from '@/components/organisms/ProjectForm';

type Params = Promise<{ id: string }>;

export default async function EditProjectPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  return (
    <PageShell>
      <AdminGuard>
        <div className="pb-16">
          <SectionHeading
            eyebrow="Edit"
            title="Edit project."
            description="프로젝트 정보와 커버를 수정할 수 있어요."
          />
        </div>
        <Hairline className="mb-16" />
        <ProjectForm mode="edit" projectId={id} />
      </AdminGuard>
    </PageShell>
  );
}
