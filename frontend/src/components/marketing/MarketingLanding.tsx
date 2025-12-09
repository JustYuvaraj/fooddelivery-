import { Star, Navigation, Phone, Clock } from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import PromoStrip from '@/components/marketing/PromoStrip';
import HighlightsSection from '@/components/marketing/HighlightsSection';

interface MarketingLandingProps {
  onSignInClick: () => void;
}

export default function MarketingLanding({ onSignInClick }: MarketingLandingProps) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader onSignInClick={onSignInClick} />
      <PromoStrip onCtaClick={onSignInClick} />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2070&auto=format&fit=crop"
            alt="food-hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.9)_10%,rgba(240,0,55,0.5)_70%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_25%,rgba(0,0,0,0.6)_50%,rgba(240,0,55,0.5))]"></div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7 text-white">
            {/* Rating strip */}
            <div className="flex items-center text-yellow-400">
              <p className="mr-2 text-xl font-semibold">4.7+</p>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5" />
              </div>
              <p className="ml-3 text-sm text-white/80">(2,300+ reviews)</p>
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Hungry? Crave. Tap. Delivered.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Your favorite restaurants delivered fast. Real‑time tracking, curated offers, and a delightful ordering experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onSignInClick}
                className="rounded-md bg-red-600 px-5 py-3 text-base font-semibold text-white shadow hover:bg-red-700"
              >
                Order Now
              </button>
              <button
                onClick={onSignInClick}
                className="rounded-md border border-white/30 bg-white/10 px-5 py-3 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Sign In
              </button>
            </div>

            {/* USPs */}
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-4 text-sm text-white/90 shadow-sm backdrop-blur">
                <Clock className="mb-2 h-5 w-5 text-red-300" />
                <p className="font-medium">30–45 min avg</p>
                <p className="text-white/70">Lightning‑fast deliveries</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4 text-sm text-white/90 shadow-sm backdrop-blur">
                <Navigation className="mb-2 h-5 w-5 text-red-300" />
                <p className="font-medium">Live tracking</p>
                <p className="text-white/70">Track every step</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4 text-sm text-white/90 shadow-sm backdrop-blur">
                <Phone className="mb-2 h-5 w-5 text-red-300" />
                <p className="font-medium">24×7 support</p>
                <p className="text-white/70">We’re here to help</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex items-end justify-end">
            {/* Hero card placeholder */}
            <div className="relative hidden w-full max-w-md md:block">
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-2xl backdrop-blur">
                <img
                  src="https://images.unsplash.com/photo-1604908554034-1d323b50bd46?q=80&w=1974&auto=format&fit=crop"
                  alt="hero-food"
                  className="h-72 w-full rounded-xl object-cover"
                />
                <div className="mt-4">
                  <p className="text-sm text-white/80">Popular now</p>
                  <h3 className="text-lg font-semibold">Chef’s Special Combo</h3>
                  <p className="text-white/70">Curated meal for two. Limited time offer.</p>
                </div>
              </div>
              <button
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                onClick={onSignInClick}
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <HighlightsSection onCtaClick={onSignInClick} />
    </div>
  );
}
