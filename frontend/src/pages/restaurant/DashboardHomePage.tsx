import { useState, useEffect } from 'react';
import restaurantOwnerService from '@/services/restaurant-owner.service';
import orderService from '@/services/order.service';
import { Restaurant } from '@/types/api.types';
import { FiPackage, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';

const DashboardHomePage = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileData, analyticsData] = await Promise.all([
        restaurantOwnerService.getProfile(),
        restaurantOwnerService.getStatistics(),
      ]);
      setRestaurant(profileData);
      setStats(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {restaurant.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayOrders || 0}</p>
            </div>
            <FiPackage className="text-4xl text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.todayRevenue || 0}</p>
            </div>
            <FiTrendingUp className="text-4xl text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders || 0}</p>
            </div>
            <FiClock className="text-4xl text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders || 0}</p>
            </div>
            <FiCheckCircle className="text-4xl text-blue-600" />
          </div>
        </div>
      </div>

      {/* Restaurant Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Restaurant Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700">
              Status: <span className="font-semibold">
                {restaurant.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p className="text-gray-700">
              Accepting Orders: <span className="font-semibold">
                {restaurant.isAcceptingOrders ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;



