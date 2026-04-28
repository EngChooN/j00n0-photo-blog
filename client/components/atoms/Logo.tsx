import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="display text-2xl tracking-tightest md:text-3xl"
      aria-label="j00n0__ home"
    >
      j00n0__
    </Link>
  );
}
