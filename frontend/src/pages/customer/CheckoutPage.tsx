import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import customerService from '@/services/customer.service';
import orderService from '@/services/order.service';
import { Address } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiPlus } from 'react-icons/fi';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, restaurantId, getTotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await customerService.getAddresses();
      setAddresses(data);
      const defaultAddress = data.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !restaurantId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        restaurantId,
        deliveryAddressId: selectedAddressId,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          specialRequests: item.specialRequests,
        })),
        specialInstructions: specialInstructions || undefined,
      };

      const order = await orderService.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/customer/orders/${order.id}/track`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();
  const deliveryFee = 50;
  const tax = total * 0.05;
  const grandTotal = total + deliveryFee + tax;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Delivery Address & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                <FiPlus className="mr-1" />
                Add New
              </Button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <FiMapPin className="mr-2 text-primary-600" />
                          <span className="font-semibold text-gray-900">{address.label}</span>
                          {address.isDefault && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No addresses saved. Please add an address.</p>
            )}

            {showAddressForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Use the profile page to manage addresses. Adding address functionality here...
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/customer/profile')}
                >
                  Manage Addresses
                </Button>
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special delivery instructions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center py-2">
                  <span className="text-gray-700">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handlePlaceOrder}
              isLoading={loading}
              disabled={!selectedAddressId || items.length === 0}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;



