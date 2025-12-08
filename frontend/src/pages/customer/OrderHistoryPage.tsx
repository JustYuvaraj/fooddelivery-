import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '@/services/order.service';
import { Order, OrderStatus } from '@/types/api.types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import Button from '@/components/common/Button';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getFilteredOrders(
        filterStatus || undefined,
        undefined,
        undefined,
        0,
        20
      );
      setOrders(data.content || data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: number) => {
    try {
      const newOrder = await orderService.reorder(orderId);
      window.location.href = `/customer/orders/${newOrder.id}/track`;
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reorder');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        
        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {order.restaurantName} • {new Date(order.placedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{order.items.length} items</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link
                to={`/customer/orders/${order.id}/track`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details
              </Link>
              {order.status === 'DELIVERED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReorder(order.id)}
                >
                  Reorder
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders found.</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;



