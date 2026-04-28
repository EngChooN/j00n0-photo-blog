'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement>;

export function FadeImage({
  className = '',
  onLoad,
  onError,
  alt,
  ...rest
}: Props) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      {...rest}
      ref={ref}
      alt={alt ?? ''}
      className={`transition-opacity duration-500 ease-editorial ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setLoaded(true);
        onError?.(e);
      }}
    />
  );
}
