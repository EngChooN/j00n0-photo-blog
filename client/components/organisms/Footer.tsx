import { InstagramLink } from '@/components/atoms/InstagramLink';
import { RssLink } from '@/components/atoms/RssLink';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-10 text-[11px] uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:px-12">
        <span>© {new Date().getFullYear()} j00n0__</span>
        <div className="flex items-center gap-2 md:gap-4">
          <InstagramLink compact />
          <RssLink />
        </div>
        <span>Photographs &amp; Words</span>
      </div>
    </footer>
  );
}
