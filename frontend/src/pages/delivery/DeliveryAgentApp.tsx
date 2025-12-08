import { Routes, Route } from 'react-router-dom';
import DeliveryLayout from '@/components/layout/DeliveryLayout';
import DashboardPage from './DashboardPage';
import AvailableTasksPage from './AvailableTasksPage';
import ActiveDeliveriesPage from './ActiveDeliveriesPage';
import DeliveryDetailsPage from './DeliveryDetailsPage';

const DeliveryAgentApp = () => {
  return (
    <DeliveryLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tasks" element={<AvailableTasksPage />} />
        <Route path="/active" element={<ActiveDeliveriesPage />} />
        <Route path="/deliveries/:assignmentId" element={<DeliveryDetailsPage />} />
      </Routes>
    </DeliveryLayout>
  );
};

export default DeliveryAgentApp;



