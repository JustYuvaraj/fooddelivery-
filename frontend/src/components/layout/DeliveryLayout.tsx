import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { FiHome, FiPackage, FiTruck, FiLogOut } from 'react-icons/fi';

interface DeliveryLayoutProps {
  children: ReactNode;
}

const DeliveryLayout: React.FC<DeliveryLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/delivery" className="text-2xl font-bold text-primary-600">
              🚚 Delivery Agent
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/delivery"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiHome className="mr-1" />
                Dashboard
              </Link>
              <Link
                to="/delivery/tasks"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiPackage className="mr-1" />
                Available Tasks
              </Link>
              <Link
                to="/delivery/active"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiTruck className="mr-1" />
                Active Deliveries
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <FiLogOut className="mr-1" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DeliveryLayout;



