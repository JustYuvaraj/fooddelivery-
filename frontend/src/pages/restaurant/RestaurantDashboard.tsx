import { Routes, Route } from 'react-router-dom';
import RestaurantLayout from '@/components/layout/RestaurantLayout';
import DashboardHomePage from './DashboardHomePage';
import MenuManagementPage from './MenuManagementPage';
import OrderManagementPage from './OrderManagementPage';
import AnalyticsPage from './AnalyticsPage';
import ProfilePage from './ProfilePage';

const RestaurantDashboard = () => {
  return (
    <RestaurantLayout>
      <Routes>
        <Route path="/" element={<DashboardHomePage />} />
        <Route path="/menu" element={<MenuManagementPage />} />
        <Route path="/orders" element={<OrderManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </RestaurantLayout>
  );
};

export default RestaurantDashboard;



