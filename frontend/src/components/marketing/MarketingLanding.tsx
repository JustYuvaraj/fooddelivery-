import { Star, Navigation, Phone, Clock, Search } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader onSignInClick={onSignInClick} />
      <PromoStrip onCtaClick={onSignInClick} />

      {/* Enhanced Hero with Search */}
      <section className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,1)_30%,rgba(240,0,55,.5)_70%,rgba(240,0,55,.5)_20%)] bg-cover bg-center bg-no-repeat lg:bg-[linear-gradient(180deg,rgba(0,0,0,1)_15%,rgba(0,0,0,.5)_35%,rgba(240,0,55,.5))] xl:bg-[linear-gradient(90deg,rgba(0,0,0,1)_25%,rgba(0,0,0,.7)_45%,rgba(0,0,0,.5)_65%,rgba(240,0,55,.5))]"></div>
        
        <div className="relative z-10 container grid grid-cols-12 gap-5 px-16 py-20">
          <div className="relative col-span-full lg:col-span-7">
            {/* Rating strip */}
            <div className="flex items-center">
              <p className="mr-2 text-xl font-semibold text-white">4.8+</p>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
              <p className="ml-3 text-sm text-white/80">(3,785 Reviews)</p>
            </div>

            <div className="relative mt-4 w-full">
              <h2 className="mb-4 text-3xl font-semibold text-white lg:text-4xl xl:text-5xl">
                <span className="text-2xl font-normal">Food Delivery</span><br/>
                <span className="leading-tight">From Your Favorite Restaurants</span>
                <span className="relative inline-block">
                  &nbsp;Fast
                  <svg xmlns="http://www.w3.org/2000/svg" width="210" height="26" viewBox="0 0 210 26" fill="none" className="absolute bottom-[-15px] right-0 w-full text-white">
                    <path d="M1.67136 20.2202C3.23789 18.1895 9.59359 16.1824 12.5756 15.4326C26.1982 11.8934 48.3459 8.80759 57.6847 8.59886C67.0235 8.39012 56.9721 10.4377 48.2168 12.3742C39.4614 14.3107 45.9921 14.3428 53.9339 13.0688C61.8757 11.7947 78.4578 9.77918 92.689 8.26169C106.92 6.7442 92.3973 7.39784 78.3569 8.60267C64.3164 9.8075 64.4314 8.6125 69.3491 7.59792C74.2668 6.58334 85.2973 3.26647 98.499 2.42991C111.701 1.59335 142.856 -0.487546 156.425 0.422125C169.994 1.3318 198.123 4.54763 204.971 5.73779C211.818 6.92794 211.383 12.0022 199.25 10.0804C187.118 8.15864 162.039 4.97743 107.961 8.729C53.8835 12.4806 13.2712 21.0025 9.12768 23.4321C4.98421 25.8617 1.96011 26.1212 3.53673 24.2082C5.11335 22.2951 5.52016 21.9639 3.84258 22.7005C2.165 23.437 -0.286797 22.7585 1.67136 20.2202Z" fill="currentColor" fill-opacity="0.24"></path>
                  </svg>
                </span>
              </h2>
            </div>
            
            <p className="mt-7 w-3/4 text-lg font-medium leading-[150%] text-white/60">
              From local favorites to popular chains — get your favorite meals delivered fast to your doorstep.
            </p>

            {/* Enhanced Search Bar */}
            <div className="mt-9 flex w-full flex-wrap items-center gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your delivery location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={onSignInClick}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
              >
                Search
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
                      ? 'bg-orange-600 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            <div className="mt-9 flex w-full flex-wrap items-center gap-6">
              <button
                onClick={onSignInClick}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
              >
                Order Now
              </button>
              <div className="h-6 w-[1px] bg-white/30" aria-hidden="true"></div>
              <button
                onClick={onSignInClick}
                className="px-8 py-3 border border-white/30 bg-white/10 text-white rounded-lg font-semibold backdrop-blur hover:bg-white/20 transition"
              >
                Sign In
              </button>
            </div>

            {/* USPs */}
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <p className="text-white/70">We're here to help</p>
              </div>
            </div>
          </div>

          <div className="relative col-span-full flex items-end justify-end pr-6 lg:col-span-5">
            <div className="relative z-10">
              <div className="relative h-full w-full">
                <img
                  src="https://images.unsplash.com/photo-1604908554034-1d323b50bd46?q=80&w=1974&auto=format&fit=crop"
                  alt="food-hero"
                  className="h-[450px] w-[350px] object-contain"
                />
                <button
                  className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition-all hover:bg-white/20 md:left-1/2 md:-translate-x-1/2"
                  onClick={onSignInClick}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex flex-col items-start whitespace-nowrap leading-none">
                    Talk to Support
                  </div>
                </button>
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
