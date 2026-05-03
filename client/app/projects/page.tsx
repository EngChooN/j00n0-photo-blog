import type { Metadata } from 'next';
import { PageShell } from '@/components/templates/PageShell';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Hairline } from '@/components/atoms/Hairline';
import { ProjectsIndex } from './ProjectsIndex';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of photo projects.',
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <div className="pb-12">
        <SectionHeading
          eyebrow="Projects"
          title="Series, gathered."
          description="여러 사진을 하나의 시리즈로 묶어 발표하는 프로젝트들."
        />
      </div>
      <Hairline className="mb-8 md:mb-12" />
      <ProjectsIndex />
    </PageShell>
  );
}
