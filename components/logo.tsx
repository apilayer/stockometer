/**
 * StockoMeter mark — a minimalist monochrome tile with an upward trend line.
 * Uses `currentColor`, so it inherits text color (white on the dark header).
 * The same glyph is mirrored in /app/icon.svg for the favicon.
 */
export function Logo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1.3"
        y="1.3"
        width="29.4"
        height="29.4"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <path
        d="M7 21 L13 15 L18 18 L25 9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 9 L25 9 L25 13.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
