import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { InstagramLink } from '@/components/atoms/InstagramLink';
import { PhotoGrid } from '@/components/organisms/PhotoGrid';

export default function HomePage() {
  return (
    <PageShell>
      <div className="grid grid-cols-12 gap-6 pb-20">
        <div className="col-span-12 md:col-span-8">
          <SectionHeading
            eyebrow={`Issue ${new Date().getFullYear()}`}
            title="Photographs, quietly arranged."
            description="j00n0__의 일지 — 도시, 빛, 그리고 잠시 멈춘 순간들."
          />
          <div className="mt-8">
            <InstagramLink label="Follow on Instagram" />
          </div>
        </div>
        <div className="col-span-12 hidden md:col-span-4 md:flex md:items-end md:justify-end">
          <p className="display text-right text-2xl leading-tight text-muted">
            A minimal
            <br />
            photo magazine.
          </p>
        </div>
      </div>
      <Hairline className="mb-20" />
      <PhotoGrid />
    </PageShell>
  );
}
