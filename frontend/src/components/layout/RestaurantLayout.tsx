import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import { FiHome, FiMenu, FiPackage, FiBarChart2, FiUser, FiLogOut } from 'react-icons/fi';

interface RestaurantLayoutProps {
  children: ReactNode;
}

const RestaurantLayout: React.FC<RestaurantLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
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
            <Link to="/restaurant" className="text-2xl font-bold text-primary-600">
              🍽️ Restaurant Dashboard
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/restaurant"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiHome className="mr-1" />
                Dashboard
              </Link>
              <Link
                to="/restaurant/menu"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiMenu className="mr-1" />
                Menu
              </Link>
              <Link
                to="/restaurant/orders"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiPackage className="mr-1" />
                Orders
              </Link>
              <Link
                to="/restaurant/analytics"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiBarChart2 className="mr-1" />
                Analytics
              </Link>
              <Link
                to="/restaurant/profile"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <FiUser className="mr-1" />
                Profile
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

export default RestaurantLayout;



