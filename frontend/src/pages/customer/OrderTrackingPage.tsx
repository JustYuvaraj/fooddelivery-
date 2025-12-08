import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import orderService from '@/services/order.service';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import { Order, OrderStatus } from '@/types/api.types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { FiCheckCircle, FiClock, FiPackage, FiTruck } from 'react-icons/fi';

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Use WebSocket for real-time updates
  const { order: wsOrder } = useOrderUpdates(id ? Number(id) : null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  useEffect(() => {
    if (wsOrder) {
      setOrder(wsOrder);
    }
  }, [wsOrder]);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const data = await orderService.getOrderById(Number(id));
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load order:', error);
      setLoading(false);
    }
  };

  const getStatusSteps = (): Array<{ status: OrderStatus; label: string; icon: any }> => {
    return [
      { status: 'PLACED', label: 'Order Placed', icon: FiCheckCircle },
      { status: 'CONFIRMED', label: 'Confirmed', icon: FiCheckCircle },
      { status: 'PREPARING', label: 'Preparing', icon: FiClock },
      { status: 'READY', label: 'Ready', icon: FiPackage },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: FiTruck },
      { status: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle },
    ];
  };

  const getCurrentStepIndex = (status: OrderStatus): number => {
    const steps = getStatusSteps();
    return steps.findIndex((step) => step.status === status);
  };

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading order...</div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStep = getCurrentStepIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Order Tracking - {order.orderNumber}
      </h1>

      {/* Order Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.status} className="flex items-start mb-8 last:mb-0">
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-16 mt-2 ${
                        isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3
                    className={`font-semibold ${
                      isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <p className="text-sm text-gray-600 mt-1">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurant:</span>
              <span className="font-medium">{order.restaurantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Placed At:</span>
              <span className="font-medium">
                {new Date(order.placedAt).toLocaleString()}
              </span>
            </div>
            {order.estimatedDeliveryTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">
                  {new Date(order.estimatedDeliveryTime).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{order.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>₹{order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

