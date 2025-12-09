import { Clock, Headphones, MapPinned, Utensils } from 'lucide-react';

interface HighlightsSectionProps {
  onCtaClick?: () => void;
}

export default function HighlightsSection({ onCtaClick }: HighlightsSectionProps) {
  return (
    <section className="relative overflow-hidden mt-20 md:mt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <h4 className="text-center text-[24px] md:text-[28px] font-semibold text-gray-900">
          <span className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="font-medium">Key</span>
            <span className="relative inline-block text-red-600 underline underline-offset-8">Highlights</span>
          </span>
        </h4>

        <div className="mt-8 md:mt-12 grid grid-cols-1 gap-10 xlg:mt-20 md:grid-cols-12 items-center">
          {/* Left: features */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* 1 */}
              <article className="flex gap-5">
                <div className="mt-[4px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <Utensils className="w-[18px] h-[18px] text-gray-900" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    <span className="text-[18px] text-red-600">1000+</span>
                    <span className="text-[16px] text-gray-900 ml-1">Restaurants</span>
                  </h3>
                  <span className="text-[15px] text-gray-500">Top picks from your city.</span>
                </div>
              </article>

              {/* 2 */}
              <article className="flex gap-5">
                <div className="mt-[4px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <Clock className="w-[18px] h-[18px] text-gray-900" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    <span className="text-[18px] text-red-600">30–45 min</span>
                    <span className="text-[16px] text-gray-900 ml-1">Avg Delivery</span>
                  </h3>
                  <span className="text-[15px] text-gray-500">Fast and reliable.</span>
                </div>
              </article>

              {/* 3 */}
              <article className="flex gap-5">
                <div className="mt-[4px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <MapPinned className="w-[20px] h-[20px] text-gray-900" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    <span className="text-[18px] text-red-600">Live</span>
                    <span className="text-[16px] text-gray-900 ml-1">Tracking</span>
                  </h3>
                  <span className="text-[15px] text-gray-500">Track every step.</span>
                </div>
              </article>

              {/* 4 */}
              <article className="flex gap-5">
                <div className="mt-[4px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <Headphones className="w-[20px] h-[20px] text-gray-900" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900">
                    <span className="text-[18px] text-red-600">24×7</span>
                    <span className="text-[16px] text-gray-900 ml-1">Support</span>
                  </h3>
                  <span className="text-[15px] text-gray-500">We’re here to help.</span>
                </div>
              </article>
            </div>

            {/* CTA row (mobile) */}
            <div className="mt-8 flex w-full flex-col-reverse items-center gap-4 sm:flex-row">
              <p className="block md:hidden text-[16px] text-gray-700">
                Hungry now? <span className="font-semibold text-gray-900">Order instantly</span>
              </p>
              <div className="flex w-full md:w-auto gap-2">
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="w-full md:w-auto rounded-lg bg-white text-red-600 border border-red-600 hover:bg-red-50 px-5 py-2.5 font-semibold"
                >
                  Start Ordering
                </button>
              </div>
              <p className="hidden md:block text-[16px] text-gray-700">
                Delivery slots open <span className="font-semibold text-gray-900">today</span>
              </p>
            </div>
          </div>

          {/* Right: phone visual + metrics */}
          <div className="md:col-span-5 flex items-center justify-center md:justify-end">
            <div className="relative flex h-fit w-[292px] items-center justify-center">
              <div className="absolute bottom-0 h-[316px] w-full rounded-xl bg-[linear-gradient(180deg,#FFFFFF_4.11%,rgba(114,114,114,0.2)_64.37%,#1F1F1F_100%)]" />

              {/* Metric cards */}
              <div className="absolute top-[60px] -left-[35%] md:-left-[45%] w-fit rounded-xl bg-white px-5 py-4 shadow-[0px_2px_16px_0px_#0000001F]">
                <p className="text-[18px] font-semibold text-blue-600">4.8★</p>
                <p className="mt-2 text-[14px] text-gray-500 leading-none">Avg Rating</p>
              </div>
              <div className="absolute top-[155px] -left-[25%] md:top-[210px] md:-left-[30%] w-fit rounded-xl bg-white px-5 py-4 shadow-[0px_2px_16px_0px_#0000001F]">
                <p className="text-[18px] font-semibold text-blue-600">30–45 min</p>
                <p className="mt-2 text-[14px] text-gray-500 leading-none">Avg Time</p>
              </div>
              <div className="absolute top-[60px] -right-1/2 -translate-x-1/2 w-fit rounded-xl bg-white px-5 py-4 shadow-[0px_2px_16px_0px_#0000001F]">
                <p className="text-[18px] font-semibold text-blue-600">1000+</p>
                <p className="mt-2 text-[14px] text-gray-500 leading-none">Partners</p>
              </div>

              {/* Phone / hero visual */}
              <div className="h-[366px] w-[260px] rounded-xl overflow-hidden border border-white/40 bg-white/10 backdrop-blur">
                <img
                  alt="highlight-visual"
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop"
                  className="h-full w-full object-cover object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
