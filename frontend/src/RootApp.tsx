import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

import MarketingLanding from '@/components/marketing/MarketingLanding';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import CustomerHomePage from '@/pages/customer/CustomerHomePage';
import RestaurantDashboard from '@/pages/restaurant/RestaurantDashboard';
import DeliveryAgentApp from '@/pages/delivery/DeliveryAgentApp';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { USER_ROLES } from '@/utils/constants';

const RootApp: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<MarketingLanding onSignInClick={() => window.location.href = '/login'} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer area */}
              <Route
                path="/customer/*"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
                    <CustomerHomePage />
                  </ProtectedRoute>
                }
              />

              {/* Restaurant owner admin dashboard */}
              <Route
                path="/restaurant/*"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT_OWNER]}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Delivery agent app */}
              <Route
                path="/delivery/*"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.DELIVERY_AGENT]}>
                    <DeliveryAgentApp />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default RootApp;
