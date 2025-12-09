import { ArrowRight, Clock } from 'lucide-react';

interface PromoStripProps {
  onCtaClick?: () => void;
}

export default function PromoStrip({ onCtaClick }: PromoStripProps) {
  return (
    <section className="sticky top-[4.45rem] z-[60] hidden w-full items-center justify-center bg-gradient-to-r from-[#FFE843] to-[#FFAD62] md:flex md:h-14 md:py-2">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-black/70" />
          <p className="font-semibold">Order hot & fresh food</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-5 w-5 text-black/70" />
          <p>Avg delivery 30–45 min</p>
        </div>
        <div>
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="rounded-lg bg-red-600 px-3 py-2 text-white shadow hover:bg-red-700"
            >
              Order Now
            </button>
          ) : (
            <a href="#restaurants" className="rounded-lg bg-red-600 px-3 py-2 text-white shadow hover:bg-red-700">
              Order Now
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
