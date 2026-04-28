import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { GuestbookForm } from '@/components/organisms/GuestbookForm';
import { GuestbookList } from '@/components/organisms/GuestbookList';

export default function GuestbookPage() {
  return (
    <PageShell>
      <div className="grid grid-cols-12 gap-6 pb-12">
        <div className="col-span-12 md:col-span-8">
          <SectionHeading
            eyebrow="Guestbook"
            title="Leave a trace."
            description="짧은 인사도, 긴 편지도 환영해요."
          />
        </div>
      </div>
      <Hairline className="mb-12" />
      <div className="space-y-16">
        <GuestbookForm />
        <GuestbookList />
      </div>
    </PageShell>
  );
}
