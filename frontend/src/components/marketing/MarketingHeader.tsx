import { Package, Menu } from 'lucide-react';

interface MarketingHeaderProps {
  onSignInClick: () => void;
}

export default function MarketingHeader({ onSignInClick }: MarketingHeaderProps) {
  return (
    <header className="sticky left-0 right-0 top-0 z-[1111] bg-black text-white shadow-sm">
      <div className="hidden lg:flex min-h-[76px] items-center justify-between px-[60px]">
        {/* Brand + Nav */}
        <div className="flex items-center gap-x-8">
          <a className="flex items-center gap-2" href="#">
            <Package className="w-7 h-7 text-red-500" />
            <span className="text-xl font-semibold">FoodExpress</span>
          </a>

          <nav className="flex items-center gap-6 text-sm">
            <a className="hover:text-red-400 transition-colors" href="#restaurants">Restaurants</a>
            <a className="hover:text-red-400 transition-colors" href="#offers">Offers</a>
            <a className="hover:text-red-400 transition-colors" href="#track">Track Order</a>
            <a className="hover:text-red-400 transition-colors" href="#help">Help</a>
          </nav>
        </div>

        {/* CTA */}
        <div>
          <button
            onClick={onSignInClick}
            className="bg-red-600 hover:bg-red-700 transition-colors px-5 py-2 rounded-md uppercase text-sm font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden h-16 w-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="w-7 h-7" />
          <a className="flex items-center gap-2" href="#">
            <Package className="w-6 h-6 text-red-500" />
            <span className="text-lg font-semibold">FoodExpress</span>
          </a>
        </div>
        <button
          onClick={onSignInClick}
          className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-1.5 rounded-md text-sm font-semibold"
        >
          Sign In
        </button>
      </div>
    </header>
  );
}
