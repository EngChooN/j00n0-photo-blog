import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { EditForm } from '@/components/organisms/EditForm';

type Params = Promise<{ id: string }>;

export default async function EditPage({ params }: { params: Params }) {
  const { id } = await params;
  return (
    <PageShell>
      <AdminGuard>
        <div className="pb-16">
          <SectionHeading
            eyebrow="Revision"
            title="Edit entry."
            description="제목·설명·위치를 다듬고 사진을 추가하거나 빼낼 수 있어요."
          />
        </div>
        <Hairline className="mb-16" />
        <EditForm postId={id} />
      </AdminGuard>
    </PageShell>
  );
}
