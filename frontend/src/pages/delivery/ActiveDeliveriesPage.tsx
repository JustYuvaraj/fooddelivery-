import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deliveryService from '@/services/delivery.service';
import { DeliveryDetailsDTO } from '@/types/api.types';
import { FiNavigation } from 'react-icons/fi';

const ActiveDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState<DeliveryDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveDeliveries();
    // Refresh every 5 seconds
    const interval = setInterval(loadActiveDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveDeliveries = async () => {
    try {
      const data = await deliveryService.getActiveDeliveries();
      setDeliveries(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load active deliveries:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading active deliveries...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Deliveries</h1>

      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <div
            key={delivery.assignmentId}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {delivery.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{delivery.status}</span>
                </p>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Pickup</p>
                <p className="font-medium text-gray-900">{delivery.restaurant.name}</p>
                <p className="text-sm text-gray-600 mt-1">{delivery.restaurant.address}</p>
                <div className="mt-2 text-xs font-mono text-gray-500">
                  {delivery.restaurant.latitude}, {delivery.restaurant.longitude}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Delivery (PRIMARY)</p>
                <p className="font-medium text-gray-900">{delivery.customer.name}</p>
                <p className="text-sm text-gray-600 mt-1">{delivery.customer.address}</p>
                <div className="mt-2 text-xs font-mono text-green-700">
                  ⭐ {delivery.customer.latitude}, {delivery.customer.longitude}
                </div>
              </div>
            </div>

            {delivery.route && (
              <div className="mb-4 text-sm text-gray-600">
                Distance: {delivery.route.distanceKm.toFixed(2)}km • 
                Est. Time: {delivery.route.estimatedTimeMinutes} min
              </div>
            )}

            <div className="flex gap-2">
              <Link
                to={`/delivery/deliveries/${delivery.assignmentId}`}
                className="flex-1"
              >
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center">
                  <FiNavigation className="mr-2" />
                  View Details & Navigate
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No active deliveries at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveDeliveriesPage;



