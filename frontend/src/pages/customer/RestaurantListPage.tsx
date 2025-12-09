import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import restaurantService from '@/services/restaurant.service';
import { Restaurant } from '@/types/api.types';
import { FiSearch, FiStar, FiClock, FiMapPin, FiFilter, FiTruck, FiTag } from 'react-icons/fi';

const RestaurantListPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const navigate = useNavigate();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!loading && restaurants.length === 1 && !searchQuery) {
      navigate(`/customer/restaurants/${restaurants[0].id}`);
    }
  }, [loading, restaurants, searchQuery, navigate]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getAllRestaurants(0, 20);
      setRestaurants(data.content || data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRestaurants();
      return;
    }

    try {
      setLoading(true);
      const data = await restaurantService.searchRestaurants(searchQuery);
      setRestaurants(data.content || data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;
    
    if (selectedCuisine) {
      filtered = filtered.filter(r => r.cuisineType?.toLowerCase().includes(selectedCuisine.toLowerCase()));
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(r => {
        const avgPrice = (r.minOrderAmount || 0);
        return avgPrice >= min && avgPrice <= max;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'delivery':
          return (a.deliveryFee || 0) - (b.deliveryFee || 0);
        case 'time':
          return (a.estimatedDeliveryTime || 0) - (b.estimatedDeliveryTime || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const cuisineTypes = ['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Japanese', 'Thai'];
  const priceRanges = ['0-200', '200-500', '500-1000', '1000+'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/customer/restaurants/${restaurant.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {restaurant.bannerUrl && (
              <img
                src={restaurant.bannerUrl}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                <div className="flex items-center text-yellow-500">
                  <FiStar className="fill-current" />
                  <span className="ml-1 text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>

              {restaurant.cuisineType && (
                <p className="text-sm text-gray-600 mb-2">{restaurant.cuisineType}</p>
              )}

              {restaurant.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {restaurant.description}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center">
                  <FiClock className="mr-1" />
                  <span>
                    {restaurant.openingTime} - {restaurant.closingTime}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-1" />
                  <span>{restaurant.deliveryRadiusKm}km</span>
                </div>
              </div>

              {!restaurant.isAcceptingOrders && (
                <div className="mt-4 px-3 py-1 bg-red-100 text-red-800 rounded text-sm text-center">
                  Currently Closed
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No restaurants found.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;



