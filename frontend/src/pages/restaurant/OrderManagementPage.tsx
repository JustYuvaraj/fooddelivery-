import { useState, useEffect } from 'react';
import orderService from '@/services/order.service';
import { Order, OrderStatus } from '@/types/api.types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import Button from '@/components/common/Button';
import { toast } from 'react-hot-toast';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getRestaurantOrders(
        filterStatus || undefined,
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

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      PLACED: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: null,
      ASSIGNED: null,
      PICKED_UP: null,
      OUT_FOR_DELIVERY: null,
      DELIVERED: null,
      CANCELLED: null,
    };
    return statusFlow[currentStatus] || null;
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
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const nextStatus = getNextStatus(order.status);

          return (
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
                    {order.customerName} • {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.productName} × {item.quantity} - ₹{item.subtotal.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>

              {nextStatus && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUpdateStatus(order.id, nextStatus)}
                >
                  Mark as {ORDER_STATUS_LABELS[nextStatus]}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders found.</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;



