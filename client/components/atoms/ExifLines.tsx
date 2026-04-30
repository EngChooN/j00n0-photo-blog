import type { Exif } from '@/lib/types';

type Props = {
  exif: Exif | null;
};

export function ExifLines({ exif }: Props) {
  if (!exif) return null;

  const line1 = [exif.camera, exif.lens].filter(Boolean) as string[];
  const line2 = [
    exif.shutterSpeed,
    exif.aperture,
    exif.iso !== undefined ? `ISO ${exif.iso}` : undefined,
    exif.focalLength,
  ].filter(Boolean) as string[];

  if (!line1.length && !line2.length) return null;

  return (
    <div className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-white/40">
      {line1.length > 0 && <ExifRow tokens={line1} />}
      {line2.length > 0 && <ExifRow tokens={line2} />}
    </div>
  );
}

function ExifRow({ tokens }: { tokens: string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-y-1">
      {tokens.map((token, i) =>
        i === 0 ? (
          <span key={i} className="whitespace-nowrap">
            {token}
          </span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center gap-2 whitespace-nowrap pl-2"
          >
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <span>{token}</span>
          </span>
        ),
      )}
    </p>
  );
}
