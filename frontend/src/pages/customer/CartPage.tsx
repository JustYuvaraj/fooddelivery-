import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/common/Button';
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const { items, restaurantId, updateQuantity, removeItem, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
        <Link to="/customer">
          <Button variant="primary">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  const total = getTotal();
  const deliveryFee = 50; // Fixed for now, should come from API
  const tax = total * 0.05; // 5% tax
  const grandTotal = total + deliveryFee + tax;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="outline" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
              <p className="text-sm text-gray-600">₹{item.product.price} each</p>
              {item.specialRequests && (
                <p className="text-xs text-gray-500 mt-1">Note: {item.specialRequests}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              <span className="font-semibold text-gray-900 min-w-[5rem] text-right">
                ₹{item.product.price * item.quantity}
              </span>

              <button
                onClick={() => {
                  removeItem(item.product.id);
                  toast.success('Item removed from cart');
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        
        <div className="space-y-2 mb-4">
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

        <Link to="/customer/checkout">
          <Button variant="primary" className="w-full">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;



