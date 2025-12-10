import { useState, useEffect, createContext, useContext } from 'react';
import { Search, MapPin, Star, Clock, ShoppingCart, User, Bell, Heart, Package, Home, Plus, Minus, ChevronRight, DollarSign, LogOut, Settings, History, Phone } from 'lucide-react';
import MarketingLanding from '@/components/marketing/MarketingLanding';

// ============================================================================
// CONTEXT & STATE MANAGEMENT
// ============================================================================

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  isAvailable?: boolean;
}

interface AuthContextType {
  user: any;
  token: string | null;
  login: (userData: any, authToken: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiService = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Customer endpoints
  getRestaurants: async (token: string, search = '', cuisine = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cuisine) params.append('cuisine', cuisine);
    
    const res = await fetch(`${API_BASE}/customer/restaurants?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    return res.json();
  },

  getRestaurantMenu: async (token: string, restaurantId: number) => {
    const res = await fetch(`${API_BASE}/customer/restaurants/${restaurantId}/menu`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  placeOrder: async (token: string, orderData: any) => {
    const res = await fetch(`${API_BASE}/customer/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
  },

  getOrders: async (token: string, page = 0) => {
    const res = await fetch(`${API_BASE}/customer/orders?page=${page}&size=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  getFavorites: async (token: string) => {
    const res = await fetch(`${API_BASE}/customer/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return res.json();
  },

  toggleFavorite: async (token: string, restaurantId: number) => {
    const res = await fetch(`${API_BASE}/customer/favorites/${restaurantId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  }
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockRestaurants = [
  {
    id: 1,
    name: "Pizza Paradise",
    cuisineType: "Italian, Pizza",
    averageRating: 4.5,
    totalReviews: 234,
    deliveryTime: 25,
    deliveryFee: 2.99,
    isAcceptingOrders: true
  },
  {
    id: 2,
    name: "Burger House",
    cuisineType: "American, Burgers",
    averageRating: 4.2,
    totalReviews: 189,
    deliveryTime: 20,
    deliveryFee: 1.99,
    isAcceptingOrders: true
  },
  {
    id: 3,
    name: "Sushi Master",
    cuisineType: "Japanese, Sushi",
    averageRating: 4.8,
    totalReviews: 456,
    deliveryTime: 35,
    deliveryFee: 3.99,
    isAcceptingOrders: true
  },
  {
    id: 4,
    name: "Curry Delight",
    cuisineType: "Indian",
    averageRating: 4.6,
    totalReviews: 312,
    deliveryTime: 30,
    deliveryFee: 2.49,
    isAcceptingOrders: true
  },
  {
    id: 5,
    name: "Taco Fiesta",
    cuisineType: "Mexican",
    averageRating: 4.3,
    totalReviews: 201,
    deliveryTime: 22,
    deliveryFee: 1.99,
    isAcceptingOrders: false
  },
  {
    id: 6,
    name: "Noodle Bar",
    cuisineType: "Chinese, Asian",
    averageRating: 4.4,
    totalReviews: 278,
    deliveryTime: 28,
    deliveryFee: 2.49,
    isAcceptingOrders: true
  }
];

const mockMenuItems = [
  {
    id: 101,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    price: 12.99,
    category: "Pizza",
    isAvailable: true
  },
  {
    id: 102,
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and extra cheese",
    price: 14.99,
    category: "Pizza",
    isAvailable: true
  },
  {
    id: 103,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing and croutons",
    price: 8.99,
    category: "Salads",
    isAvailable: true
  },
  {
    id: 104,
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 4.99,
    category: "Sides",
    isAvailable: true
  },
  {
    id: 105,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center",
    price: 6.99,
    category: "Desserts",
    isAvailable: true
  }
];

const mockOrders = [
  {
    id: 1001,
    restaurantName: "Pizza Paradise",
    status: "delivered",
    placedAt: new Date(Date.now() - 86400000).toISOString(),
    totalAmount: 34.97,
    items: [
      { productName: "Margherita Pizza", quantity: 2, totalPrice: 25.98 },
      { productName: "Garlic Bread", quantity: 2, totalPrice: 8.99 }
    ]
  },
  {
    id: 1002,
    restaurantName: "Burger House",
    status: "preparing",
    placedAt: new Date().toISOString(),
    totalAmount: 22.48,
    items: [
      { productName: "Cheeseburger", quantity: 1, totalPrice: 9.99 },
      { productName: "Fries", quantity: 2, totalPrice: 7.98 },
      { productName: "Cola", quantity: 1, totalPrice: 2.99 }
    ]
  },
  {
    id: 1003,
    restaurantName: "Sushi Master",
    status: "confirmed",
    placedAt: new Date(Date.now() - 3600000).toISOString(),
    totalAmount: 45.99,
    items: [
      { productName: "California Roll", quantity: 2, totalPrice: 24.98 },
      { productName: "Spicy Tuna Roll", quantity: 1, totalPrice: 14.99 },
      { productName: "Miso Soup", quantity: 2, totalPrice: 5.98 }
    ]
  }
];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function FoodDeliveryApp() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showMarketing, setShowMarketing] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: any, authToken: string) => {
    console.log('Logging in user:', userData);
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('home');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id) as CartItem | undefined;
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId) as CartItem | undefined;
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const authContextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    cart,
    addToCart,
    removeFromCart,
    clearCart
  };

  if (!token) {
    return (
      <AuthContext.Provider value={authContextValue}>
        {showMarketing ? (
          <MarketingLanding onSignInClick={() => setShowMarketing(false)} />
        ) : (
          <AuthScreen />
        )}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-gray-50">
        <Header setCurrentView={setCurrentView} />
        <main className="pb-20">
          {currentView === 'home' && <HomeView />}
          {currentView === 'restaurants' && <RestaurantsView />}
          {currentView === 'orders' && <OrdersView />}
          {currentView === 'favorites' && <FavoritesView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'cart' && <CartView setCurrentView={setCurrentView} />}
        </main>
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </AuthContext.Provider>
  );
}

// ============================================================================
// AUTH SCREEN
// ============================================================================

function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: 'customer@test.com',
    password: 'password123',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Try to login with backend
        try {
          const response = await apiService.login(formData.email, formData.password);
          login(response.user, response.token);
        } catch (apiErr) {
          // Fallback to mock login for demo
          console.log('Backend login failed, using demo mode:', apiErr);
          const mockUser = {
            id: 1,
            email: formData.email,
            firstName: 'Demo',
            lastName: 'User',
            role: 'CUSTOMER'
          };
          const mockToken = 'demo-token-' + Date.now();
          login(mockUser, mockToken);
        }
      } else {
        // Try to register with backend
        try {
          const response = await apiService.register(formData);
          login(response.user, response.token);
        } catch (apiErr) {
          // Fallback to mock registration for demo
          console.log('Backend registration failed, using demo mode:', apiErr);
          const mockUser = {
            id: 1,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: 'CUSTOMER'
          };
          const mockToken = 'demo-token-' + Date.now();
          login(mockUser, mockToken);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FoodExpress</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required={!isLogin}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required={!isLogin}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required={!isLogin}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p className="font-mono text-xs mt-1">customer@test.com / password123</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  const { user, cart } = useAuth();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">FoodExpress</h1>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>Deliver to {user?.firstName || 'Customer'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>

          <button
            onClick={() => setCurrentView('cart')}
            className="relative"
          >
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-white text-xs flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// HOME VIEW
// ============================================================================

function HomeView() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await apiService.getRestaurants(token!);
      setRestaurants(data.content || data || []);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      // Mock data for demo
      setRestaurants(mockRestaurants);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRestaurants(token!, searchQuery);
      setRestaurants(data.content || data || []);
    } catch (err) {
      setRestaurants(mockRestaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };

  if (selectedRestaurant) {
    return <RestaurantDetail restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for restaurants or cuisines..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['All', 'Pizza', 'Burger', 'Sushi', 'Indian', 'Chinese', 'Italian', 'Mexican'].map(cat => (
            <button
              key={cat}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full whitespace-nowrap hover:border-orange-600 hover:text-orange-600 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Restaurants</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => setSelectedRestaurant(restaurant)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RESTAURANTS VIEW (SEARCH)
// ============================================================================

function RestaurantsView() {
  return <HomeView />;
}

// ============================================================================
// RESTAURANT CARD
// ============================================================================

function RestaurantCard({ restaurant, onClick }: { restaurant: any; onClick: () => void }) {
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const handleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await apiService.toggleFavorite(token!, restaurant.id);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
    >
      <div className="relative h-40">
        <img
          src={restaurant.imageUrl || `https://source.unsplash.com/400x300/?restaurant,food&sig=${restaurant.id}`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        {!restaurant.isAcceptingOrders && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold">Closed</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisineType || 'Multiple Cuisines'}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-yellow-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">{restaurant.averageRating || 4.5}</span>
            <span className="text-gray-500">({restaurant.totalReviews || 100})</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime || 30} min</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${restaurant.deliveryFee || 2.99}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RESTAURANT DETAIL
// ============================================================================

function RestaurantDetail({ restaurant, onBack }: { restaurant: any; onBack: () => void }) {
  const { token, addToCart } = useAuth();
  const [menu, setMenu] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await apiService.getRestaurantMenu(token!, restaurant.id);
      setMenu(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
      // Mock data for demo - fix type by adding quantity
      setMenu(mockMenuItems.map((item: any) => ({ ...item, quantity: 0 })) as any);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const filteredMenu = selectedCategory === 'All' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Restaurant Header */}
      <div className="relative h-64 bg-gradient-to-br from-orange-500 to-red-600">
        <img
          src={restaurant.imageUrl || `https://source.unsplash.com/1200x400/?restaurant&sig=${restaurant.id}`}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-50"
        />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              <span>{restaurant.averageRating || 4.5}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime || 30} min</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>Delivery ${restaurant.deliveryFee || 2.99}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 bg-white border-b border-gray-200 z-30">
        <div className="px-4 overflow-x-auto">
          <div className="flex gap-6 py-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat || 'All')}
                className={`whitespace-nowrap pb-2 border-b-2 transition ${
                  selectedCategory === cat
                    ? 'border-orange-600 text-orange-600 font-semibold'
                    : 'border-transparent text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="bg-gray-200 w-24 h-24 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMenu.map(item => (
              <MenuItem key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MENU ITEM
// ============================================================================

function MenuItem({ item, onAddToCart }: { item: CartItem; onAddToCart: (item: CartItem) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
      <div className="flex gap-4">
        <img
          src={item.imageUrl || `https://source.unsplash.com/200x200/?food&sig=${item.id}`}
          alt={item.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
            {item.isAvailable ? (
              <button
                onClick={() => onAddToCart(item)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Add to Cart
              </button>
            ) : (
              <span className="text-sm text-gray-500">Not Available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CART VIEW
// ============================================================================

function CartView({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  const { cart, addToCart, removeFromCart, clearCart, token } = useAuth();
  const [placing, setPlacing] = useState<boolean>(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async () => {
    setPlacing(true);
    try {
      const orderData = {
        restaurantId: 1, // Get from cart items
        deliveryAddress: "123 Main St",
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };
      
      await apiService.placeOrder(token!, orderData);
      clearCart();
      alert('Order placed successfully!');
      setCurrentView('orders');
    } catch (err) {
      alert('Failed to place order: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add items from restaurants to get started</p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-0">
            <img
              src={item.imageUrl || `https://source.unsplash.com/100x100/?food&sig=${item.id}`}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => addToCart(item)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Order Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={placing}
        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition disabled:opacity-50"
      >
        {placing ? 'Placing Order...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
}

// ============================================================================
// ORDERS VIEW
// ============================================================================

function OrdersView() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiService.getOrders(token!);
      setOrders(data.content || data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      // Mock data for demo
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {['all', 'active', 'delivered', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition ${
              filter === f
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="bg-gray-200 h-4 w-1/4 rounded mb-4"></div>
              <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ORDER CARD
// ============================================================================

function OrderCard({ order }: { order: any }) {
  const statusColors: { [key: string]: string } = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusClass = statusColors[order.status?.toLowerCase() || 'placed'] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">{order.restaurantName}</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(order.placedAt || Date.now()).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
          {order.status || 'Placed'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600">{item.quantity}x {item.productName}</span>
            <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">Total</span>
        <span className="font-bold text-orange-600 text-lg">${order.totalAmount.toFixed(2)}</span>
      </div>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <button className="mt-4 w-full py-3 bg-orange-50 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition">
          Track Order
        </button>
      )}
    </div>
  );
}

// ============================================================================
// FAVORITES VIEW
// ============================================================================

function FavoritesView() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await apiService.getFavorites(token!);
      setFavorites(data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setFavorites(mockRestaurants.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  if (selectedRestaurant) {
    return <RestaurantDetail restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorite Restaurants</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="bg-gray-200 h-40 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No favorite restaurants yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => setSelectedRestaurant(restaurant)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROFILE VIEW
// ============================================================================

function ProfileView() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">{user?.phone}</p>
          </div>
        </div>
        
        <button className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Edit Profile
        </button>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        {[
          { icon: MapPin, label: 'Delivery Addresses', badge: '2' },
          { icon: History, label: 'Order History' },
          { icon: Settings, label: 'Settings' },
          { icon: Bell, label: 'Notifications', badge: '3' },
          { icon: Phone, label: 'Help & Support' }
        ].map((item, idx) => (
          <button
            key={idx}
            className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-4 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}

// ============================================================================
// BOTTOM NAVIGATION
// ============================================================================

function BottomNav({ currentView, setCurrentView }: { currentView: string; setCurrentView: (view: string) => void }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'restaurants', icon: Search, label: 'Search' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition ${
                currentView === item.id
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

