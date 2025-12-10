import {
  Star,
  Navigation,
  Phone,
  Clock,
  Search,
  ChefHat,
  Flame,
  Sparkles,
  Bike,
  ArrowRight,
  Smartphone,
  MapPin,
} from 'lucide-react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import PromoStrip from '@/components/marketing/PromoStrip';
import HighlightsSection from '@/components/marketing/HighlightsSection';
import { useState } from 'react';

interface MarketingLandingProps {
  onSignInClick: () => void;
}

export default function MarketingLanding({ onSignInClick }: MarketingLandingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisineTypes = ['All', 'Italian', 'American', 'Japanese', 'Indian', 'Chinese', 'Mexican', 'Thai'];
  const featuredCollections = [
    {
      title: 'Night Bites Club',
      subtitle: 'Curated after-hours picks',
      badge: 'Late Night',
      accent: 'from-[#F97316]/90 via-[#F43F5E]/80 to-[#A855F7]/70',
      image:
        'https://images.unsplash.com/photo-1606755962773-0e7d4c542f56?q=80&w=1974&auto=format&fit=crop',
    },
    {
      title: 'Garden Fresh',
      subtitle: 'Handpicked vegan favourites',
      badge: 'Editor’s Pick',
      accent: 'from-[#22C55E]/90 via-[#14B8A6]/80 to-[#0EA5E9]/70',
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1974&auto=format&fit=crop',
    },
    {
      title: 'Fire & Spice',
      subtitle: 'Global heat seekers menu',
      badge: 'Trending',
      accent: 'from-[#FACC15]/90 via-[#F97316]/80 to-[#EF4444]/70',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1974&auto=format&fit=crop',
    },
  ];

  const howItWorksSteps = [
    {
      icon: MapPin,
      title: 'Pin your location',
      description: 'Find restaurants that deliver lightning fast to your neighbourhood.',
    },
    {
      icon: ChefHat,
      title: 'Pick the feast',
      description: 'Explore chef-crafted menus, seasonal drops, and local gems.',
    },
    {
      icon: Bike,
      title: 'Track every move',
      description: 'Follow your rider in real-time and get notified when we arrive.',
    },
  ];

  const testimonials = [
    {
      quote:
        '“The curated collections are a game changer. I find hidden gems every weekend—delivery is always on point.”',
      name: 'Amara N.',
      role: 'Food blogger, Bengaluru',
    },
    {
      quote:
        '“Live tracking + helpful support meant my dinner party started exactly on time. Absolutely seamless experience.”',
      name: 'Raghav S.',
      role: 'Product manager, Hyderabad',
    },
    {
      quote:
        '“Late night cravings? Sorted. The interface feels luxe and the recommendations are dangerously good.”',
      name: 'Simran K.',
      role: 'Design consultant, Mumbai',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader onSignInClick={onSignInClick} />
      <PromoStrip onCtaClick={onSignInClick} />

      {/* Enhanced Hero with Search */}
      <section className="relative overflow-hidden bg-[#040308]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#F43F5E1A,transparent_55%),radial-gradient(circle_at_bottom_right,#22D3EE33,transparent_50%)]" />
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#F43F5E]/40 via-[#F97316]/30 to-transparent blur-3xl" />
          <div className="absolute -bottom-12 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-[#22D3EE]/30 via-[#6366F1]/30 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 gap-6 px-6 py-20 lg:gap-10 lg:px-10 xl:px-0">
          <div className="relative col-span-full lg:col-span-7">
            {/* Rating strip */}
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex items-center">
                <p className="mr-2 text-xl font-semibold text-white">4.8</p>
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
              <span className="text-sm">Loved by 3,785+ foodies</span>
            </div>

            <div className="relative mt-4 w-full">
              <h1 className="mb-5 text-[2.7rem] font-semibold leading-[1.08] text-white md:text-[3.4rem] lg:text-[3.8rem]" style={{ fontFamily: '"Fraunces", "Georgia", serif' }}>
                A couture delivery experience crafted for<br className="hidden md:block" />
                <span className="mt-2 inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#F43F5E] to-[#6366F1]">
                  bold palates & late-night cravings
                </span>
              </h1>
            </div>

            <p className="mt-6 max-w-xl text-lg font-medium leading-[1.65] text-white/70">
              Discover chef-led kitchens, limited-edition drops, and hyperlocal classics. We orchestrate your meal from prep to doorstep without missing a beat.
            </p>

            {/* Enhanced Search Bar */}
            <div className="mt-9 flex w-full flex-wrap items-center gap-5">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-12 py-4 text-base text-white placeholder-white/60 shadow-[0px_14px_30px_0px_rgba(15,23,42,0.25)] backdrop-blur focus:border-white/50 focus:ring-2 focus:ring-[#F97316]/70"
                />
              </div>
              <button
                onClick={onSignInClick}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F97316] via-[#F43F5E] to-[#6366F1] px-7 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-transform hover:scale-[1.02]"
              >
                Find Restaurants
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Cuisine Filters */}
            <div className="mt-6 flex flex-wrap gap-3">
              {cuisineTypes.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCuisine === cuisine
                      ? 'bg-white text-[#040308] shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            <div className="mt-8 flex w-full flex-wrap items-center gap-5 text-white/80">
              <button
                onClick={onSignInClick}
                className="rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wide text-[#040308] transition-transform hover:scale-[1.01]"
              >
                Order Now
              </button>
              <div className="hidden h-6 w-px bg-white/30 sm:block" aria-hidden="true"></div>
              <button
                onClick={onSignInClick}
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/20"
              >
                Sign In
              </button>
              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                <Sparkles className="h-4 w-4 text-[#A855F7]" />
                <p className="text-xs uppercase tracking-[0.3em]">Limited drops every Friday</p>
              </div>
            </div>

            {/* USPs */}
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/90 shadow-[0_18px_40px_0_rgba(15,23,42,0.18)] backdrop-blur">
                <Clock className="mb-3 h-6 w-6 text-[#F97316]" />
                <p className="font-semibold">30–45 min avg</p>
                <p className="text-white/70">Lightning-fast deliveries curated by local partners.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/90 shadow-[0_18px_40px_0_rgba(15,23,42,0.18)] backdrop-blur">
                <Navigation className="mb-3 h-6 w-6 text-[#22D3EE]" />
                <p className="font-semibold">Live tracking</p>
                <p className="text-white/70">Hyper precise routes with rider ETA intelligence built-in.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/90 shadow-[0_18px_40px_0_rgba(15,23,42,0.18)] backdrop-blur">
                <Phone className="mb-3 h-6 w-6 text-[#A855F7]" />
                <p className="font-semibold">24×7 support</p>
                <p className="text-white/70">Concierge-style chat and phone support on demand.</p>
              </div>
            </div>
          </div>

          <div className="relative col-span-full flex items-center justify-center lg:col-span-5">
            <div className="relative flex h-full w-full max-w-sm flex-col items-center justify-center">
              <div className="relative z-10 overflow-hidden rounded-[44px] border border-white/10 bg-gradient-to-b from-white/20 via-white/5 to-white/10 p-4 shadow-[0_30px_60px_rgba(15,23,42,0.3)] backdrop-blur">
                <div className="rounded-[32px] bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1604908554034-1d323b50bd46?q=80&w=1974&auto=format&fit=crop"
                    alt="food-hero"
                    className="h-[460px] w-full rounded-[32px] object-cover"
                  />
                </div>
                <div className="absolute -left-10 top-14 hidden w-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white shadow-lg backdrop-blur lg:block">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">ETA</p>
                  <p className="mt-2 text-lg font-semibold">28 min</p>
                  <p className="text-xs text-white/60">Rider is 1.2 km away</p>
                </div>
                <div className="absolute -right-12 bottom-10 hidden w-40 rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-white shadow-lg backdrop-blur lg:block">
                  <div className="flex items-center gap-3">
                    <Phone className="h-10 w-10 rounded-full bg-white p-2 text-[#F43F5E]" />
                    <div>
                      <p className="text-sm font-semibold">Concierge</p>
                      <p className="text-xs text-white/60">Tap to talk</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Delivering now</p>
                  <p className="mt-1 text-lg font-semibold">Chef Arjun • Ember Room</p>
                </div>
                <Flame className="h-8 w-8 text-[#F97316]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature collections */}
      <section className="relative -mt-6 bg-white pb-24 pt-28" id="restaurants">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#040308] via-[#040308]/60 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 lg:px-10 xl:px-0">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-gray-600">
              Curated drops
            </span>
            <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl" style={{ fontFamily: '"Clash Display", "Trebuchet MS", sans-serif' }}>
              Signature collections to match the moment
            </h2>
            <p className="max-w-2xl text-base text-gray-600">
              Crafted by our culinary scouts, refreshed weekly with trending chefs, seasonal ingredients, and hyperlocal heroes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredCollections.map(collection => (
              <article
                key={collection.title}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br p-[2px] shadow-[0_28px_60px_rgba(15,23,42,0.08)]"
                style={{ backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.07), rgba(15,23,42,0.01))` }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-black">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${collection.accent} opacity-90`} />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-6 pb-8 pt-20 text-left text-white">
                    <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">{collection.badge}</span>
                    <h3 className="text-2xl font-semibold">{collection.title}</h3>
                    <p className="text-sm text-white/80">{collection.subtitle}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0A0A10] py-24 text-white" id="track">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 lg:px-10 xl:px-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">The ritual</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl" style={{ fontFamily: '"Clash Display", "Trebuchet MS", sans-serif' }}>
                Exceptional food, orchestrated in three elegant moves
              </h2>
            </div>
            <button
              onClick={onSignInClick}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              Start your journey
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorksSteps.map(step => (
              <div
                key={step.title}
                className="relative flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_50px_rgba(15,23,42,0.25)] backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <step.icon className="h-6 w-6 text-[#F97316]" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-[#F7F4EF] py-24" id="offers">
        <div className="absolute -top-40 left-1/2 h-80 w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F97316]/20 via-[#F43F5E]/10 to-transparent blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 text-gray-900 lg:px-10 xl:px-0">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-gray-600">
              Voices we adore
            </span>
            <h2 className="mt-4 text-3xl font-semibold md:text-[2.5rem]" style={{ fontFamily: '"Fraunces", "Georgia", serif' }}>
              Stories from our tastemakers
            </h2>
            <p className="mt-3 max-w-2xl text-base text-gray-600">
              Every order fuels our culinary collective. Here’s how FoodExpress elevates everyday rituals into experiential dining.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map(testimonial => (
              <figure
                key={testimonial.name}
                className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_50px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
              >
                <Sparkles className="h-6 w-6 text-[#F97316]" />
                <blockquote className="mt-4 text-sm leading-7 text-gray-700">{testimonial.quote}</blockquote>
                <figcaption className="mt-6">
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="relative overflow-hidden bg-[#0B0911] py-24 text-white" id="help">
        <div className="absolute inset-0">
          <div className="absolute -top-32 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#6366F1]/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-[#F43F5E]/40 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-0">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              On the move
            </span>
            <h2 className="text-3xl font-semibold md:text-[2.6rem]" style={{ fontFamily: '"Clash Display", "Trebuchet MS", sans-serif' }}>
              Keep the heat in your pocket with the FoodExpress app
            </h2>
            <p className="text-base text-white/70">
              Personalized alerts, experiential loyalty, and immersive tracking designed for the restless foodie.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0B0911] shadow-lg transition hover:-translate-y-0.5">
                <Smartphone className="h-5 w-5" />
                Download for iOS
              </button>
              <button className="inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                <Smartphone className="h-5 w-5" />
                Download for Android
              </button>
            </div>
          </div>

          <div className="relative flex w-full max-w-md items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-[0_28px_60px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="rounded-2xl bg-black/70 p-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Navigation className="h-6 w-6 text-[#22D3EE]" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Live now</p>
                    <p className="mt-1 text-lg font-semibold">Rider at your door in 04:52</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4 text-sm text-white/70">
                  <p>✨ Luxury chef collaboration menu updated today.</p>
                  <p>🔥 Heat-safe packaging keeps dishes at the perfect temperature.</p>
                  <p>🌙 Exclusive access to midnight tasting menus all week long.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <HighlightsSection onCtaClick={onSignInClick} />
    </div>
  );
}
