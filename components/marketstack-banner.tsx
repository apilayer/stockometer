/**
 * Promotional banner showcasing the data source behind StockoMeter:
 * Marketstack, powered by APILayer.
 *
 * Two variants:
 *  - "full"    full-width hero-style ad (default), good for page bodies.
 *  - "compact" slim bottom bar, good for fixed/floating placements.
 *
 * Both reuse the brand logos in /public/brand. The APILayer wordmark ships
 * in full colour, so `brightness-0 invert` flattens it to white to sit on the
 * dark gradient next to the white Marketstack mark.
 */

const SIGNUP_URL = "https://marketstack.com/signup/free";
const BACKDROP =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop";

function BrandLockup({ size }: { size: "sm" | "md" }) {
  const h = size === "md" ? "h-4" : "h-3";
  const divider = size === "md" ? "h-4" : "h-3";
  return (
    <div className="flex items-center gap-2">
      <img
        src="/brand/marketstack-white.svg"
        alt="Marketstack"
        className={`${h} w-auto`}
      />
      <span className={`w-px ${divider} bg-white/25`} />
      <img
        src="/brand/apilayer-logo.png"
        alt="APILayer"
        className={`${h} w-auto brightness-0 invert opacity-90`}
      />
    </div>
  );
}

export function MarketstackBanner({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  if (variant === "compact") {
    return (
      <a
        href={SIGNUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block w-full max-w-[440px] h-[44px] rounded-lg overflow-hidden border border-[#2480fc]/30 shadow-2xl transition select-none hover:border-[#2480fc]/70"
      >
        <img
          src={BACKDROP}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity group-hover:opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c44]/90 via-[#070b18]/85 to-[#2480fc]/30" />
        <div className="relative z-10 flex h-full items-center justify-between gap-2 px-3">
          <BrandLockup size="sm" />
          <span className="hidden truncate font-sans text-[10px] text-white/65 sm:inline">
            Real-time stock market data API
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#2480fc] px-2.5 py-1 text-[10px] font-bold text-white shadow transition group-hover:bg-[#3583fc]">
            Get API Key
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={SIGNUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl border border-[#2480fc]/25 bg-[#070b18] shadow-2xl transition select-none hover:border-[#2480fc]/60"
    >
      <img
        src={BACKDROP}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1c44]/85 via-[#070b18]/80 to-[#2480fc]/25" />

      <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div className="space-y-2">
          <BrandLockup size="md" />
          <p className="text-[10px] font-bold tracking-widest text-[#6AA0FF] uppercase">
            Real-time stock market data API
          </p>
          <h3 className="max-w-xl text-xl leading-tight font-extrabold tracking-tight text-white sm:text-2xl">
            Live &amp; historical market data,
            <br className="hidden sm:block" /> straight from the source.
          </h3>
          <p className="max-w-md font-sans text-xs text-white/55">
            70+ exchanges · 30,000+ tickers · the same Marketstack API that
            powers this dashboard, by APILayer.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#2480fc] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition group-hover:bg-[#3583fc]">
            Get Your Free API Key
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
          <span className="font-sans text-[10px] text-white/55">
            No credit card required
          </span>
        </div>
      </div>
    </a>
  );
}
