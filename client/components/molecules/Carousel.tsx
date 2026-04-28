'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Photo } from '@/lib/types';
import { assetUrl } from '@/lib/api';
import { FadeImage } from '@/components/atoms/FadeImage';

type Variant = 'dark' | 'light';

type Props = {
  photos: Photo[];
  index: number;
  onIndexChange: (index: number) => void;
  variant?: Variant;
  onSlideClick?: (index: number) => void;
};

const ARROW_BASE =
  'absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-editorial disabled:cursor-not-allowed';

const VARIANTS: Record<
  Variant,
  {
    arrowPrev: string;
    arrowNext: string;
    arrowGlyph: string;
    dotActive: string;
    dotInactive: string;
    dotsWrap: string;
  }
> = {
  dark: {
    arrowPrev: `${ARROW_BASE} left-4 hidden px-3 py-3 text-2xl text-white/50 opacity-0 hover:text-white disabled:opacity-20 group-hover:opacity-100 md:left-8 md:flex`,
    arrowNext: `${ARROW_BASE} right-4 hidden px-3 py-3 text-2xl text-white/50 opacity-0 hover:text-white disabled:opacity-20 group-hover:opacity-100 md:right-8 md:flex`,
    arrowGlyph: '',
    dotActive: 'bg-white',
    dotInactive: 'bg-white/30',
    dotsWrap:
      'pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden',
  },
  light: {
    arrowPrev: `${ARROW_BASE} left-2 flex h-7 w-7 items-center justify-center border border-line bg-paper/80 text-ink/40 backdrop-blur-sm hover:text-ink disabled:opacity-30 md:opacity-0 md:group-hover:opacity-100`,
    arrowNext: `${ARROW_BASE} right-2 flex h-7 w-7 items-center justify-center border border-line bg-paper/80 text-ink/40 backdrop-blur-sm hover:text-ink disabled:opacity-30 md:opacity-0 md:group-hover:opacity-100`,
    arrowGlyph: 'text-[12px] leading-none',
    dotActive: 'bg-ink/70',
    dotInactive: 'bg-ink/25',
    dotsWrap:
      'pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 md:opacity-0 md:transition-opacity md:duration-200 md:ease-editorial md:group-hover:opacity-100',
  },
};

export function Carousel({
  photos,
  index,
  onIndexChange,
  variant = 'dark',
  onSlideClick,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    containScroll: 'trimSnaps',
    startIndex: index,
  });
  const [selectedIndex, setSelectedIndex] = useState(index);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const i = emblaApi.selectedScrollSnap();
      setSelectedIndex(i);
      onIndexChange(i);
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, photos.length]);

  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index, true);
    }
  }, [emblaApi, index]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi],
  );
  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi],
  );

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const DRAG_CLICK_THRESHOLD = 8;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleSlideClick = (slideIndex: number, e: React.MouseEvent) => {
    if (!onSlideClick) return;
    const start = pointerStart.current;
    if (start) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx > DRAG_CLICK_THRESHOLD || dy > DRAG_CLICK_THRESHOLD) return;
    }
    onSlideClick(slideIndex);
  };

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex < photos.length - 1;
  const styles = VARIANTS[variant];
  const lockAspect = variant === 'light';
  const aspectStyle =
    lockAspect && photos[0]
      ? { aspectRatio: `${photos[0].width} / ${photos[0].height}` }
      : undefined;
  const imageClass = lockAspect
    ? 'h-full w-full object-contain'
    : 'max-h-[calc(100vh-14rem)] max-w-full object-contain';
  // flex-[0_0_calc(100%+1px)] avoids sub-pixel bleed of neighbor slides at snap points.
  const slideClass =
    'relative flex min-w-0 flex-[0_0_calc(100%+1px)] items-center justify-center';

  return (
    <div className="group relative w-full">
      <div className="overflow-hidden" ref={emblaRef} style={aspectStyle}>
        <div className={lockAspect ? 'flex h-full' : 'flex'}>
          {photos.map((photo, i) => {
            const eager =
              i === selectedIndex ||
              i === selectedIndex - 1 ||
              i === selectedIndex + 1;
            const slideContent = (
              <FadeImage
                src={assetUrl(photo.src)}
                alt=""
                width={photo.width}
                height={photo.height}
                className={imageClass}
                loading={eager ? 'eager' : 'lazy'}
                onClick={(e) => {
                  if (onSlideClick) return;
                  e.stopPropagation();
                }}
              />
            );
            return (
              <div key={photo.id} className={slideClass}>
                {onSlideClick ? (
                  <button
                    type="button"
                    onPointerDown={handlePointerDown}
                    onClick={(e) => handleSlideClick(i, e)}
                    aria-label={`Open photo ${i + 1}`}
                    className="block h-full w-full cursor-zoom-in"
                  >
                    {slideContent}
                  </button>
                ) : (
                  slideContent
                )}
              </div>
            );
          })}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            tabIndex={-1}
            aria-label="Previous photo"
            className={styles.arrowPrev}
          >
            <span className={styles.arrowGlyph}>←</span>
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            tabIndex={-1}
            aria-label="Next photo"
            className={styles.arrowNext}
          >
            <span className={styles.arrowGlyph}>→</span>
          </button>
          <div className={styles.dotsWrap}>
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full ${
                  i === selectedIndex ? styles.dotActive : styles.dotInactive
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
