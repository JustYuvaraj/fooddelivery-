import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '@/components/layout/CustomerLayout';
import RestaurantListPage from './RestaurantListPage';
import RestaurantDetailPage from './RestaurantDetailPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderTrackingPage from './OrderTrackingPage';
import OrderHistoryPage from './OrderHistoryPage';
import ProfilePage from './ProfilePage';

const CustomerHomePage = () => {
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<RestaurantListPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerHomePage;



