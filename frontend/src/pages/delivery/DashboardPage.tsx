import { useState, useEffect } from 'react';
import deliveryService from '@/services/delivery.service';
import Button from '@/components/common/Button';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';

const DashboardPage = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const active = await deliveryService.getActiveDeliveries();
      setActiveCount(active.length);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleToggleOnline = async () => {
    try {
      await deliveryService.setOnlineStatus(!isOnline);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your delivery tasks</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
          <Button
            variant={isOnline ? 'danger' : 'primary'}
            onClick={handleToggleOnline}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
            <FiTruck className="text-4xl text-primary-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;



