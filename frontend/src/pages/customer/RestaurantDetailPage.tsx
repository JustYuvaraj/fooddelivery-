import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import restaurantService from '@/services/restaurant.service';
import { useCart } from '@/contexts/CartContext';
import { Restaurant, Product } from '@/types/api.types';
import { FiStar, FiClock, FiMapPin, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '@/components/common/Button';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, restaurantId, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadRestaurant();
      loadMenu();
    }
  }, [id]);

  // Clear cart if switching restaurants
  useEffect(() => {
    if (restaurant && restaurantId && restaurantId !== restaurant.id) {
      clearCart();
    }
  }, [restaurant, restaurantId, clearCart]);

  const loadRestaurant = async () => {
    if (!id) return;
    try {
      const data = await restaurantService.getRestaurantById(Number(id));
      setRestaurant(data);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      toast.error('Failed to load restaurant');
    }
  };

  const loadMenu = async () => {
    if (!id) return;
    try {
      const data = await restaurantService.getRestaurantMenu(Number(id));
      setMenu(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load menu:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const categories = Array.from(new Set(menu.map((item) => item.category)));

  const filteredMenu = selectedCategory
    ? menu.filter((item) => item.category === selectedCategory)
    : menu;

  if (loading || !restaurant) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {restaurant.bannerUrl && (
          <img
            src={restaurant.bannerUrl}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
              {restaurant.cuisineType && (
                <p className="text-lg text-gray-600 mb-2">{restaurant.cuisineType}</p>
              )}
            </div>
            <div className="flex items-center text-yellow-500">
              <FiStar className="fill-current" />
              <span className="ml-2 text-xl font-bold">{restaurant.rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-600">({restaurant.totalReviews})</span>
            </div>
          </div>

          {restaurant.description && (
            <p className="text-gray-700 mb-4">{restaurant.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FiClock className="mr-2" />
              <span>
                Open: {restaurant.openingTime} - {restaurant.closingTime}
              </span>
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-2" />
              <span>Delivery radius: {restaurant.deliveryRadiusKm}km</span>
            </div>
            <div>
              <span>Min. order: ₹{restaurant.minOrderAmount}</span>
            </div>
          </div>

          {!restaurant.isAcceptingOrders && (
            <div className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded">
              Currently not accepting orders
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <span className="text-lg font-bold text-primary-600">₹{product.price}</span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{product.category}</span>
                {!product.isAvailable ? (
                  <span className="text-xs text-red-600">Out of Stock</span>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center"
                  >
                    <FiShoppingCart className="mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMenu.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No items found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;



