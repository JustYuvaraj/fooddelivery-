import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deliveryService from '@/services/delivery.service';
import { DeliveryDetailsDTO } from '@/types/api.types';
import DeliveryMap from '@/components/maps/DeliveryMap';
import Button from '@/components/common/Button';
import { toast } from 'react-hot-toast';
import { FiMapPin, FiNavigation, FiPhone, FiCheckCircle, FiTruck } from 'react-icons/fi';

const DeliveryDetailsPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<DeliveryDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) {
      loadDetails();
    }
  }, [assignmentId]);

  const loadDetails = async () => {
    if (!assignmentId) return;
    try {
      const data = await deliveryService.getDeliveryDetails(Number(assignmentId));
      setDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load delivery details:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'picked-up' | 'out-for-delivery' | 'delivered') => {
    if (!details) return;

    try {
      switch (status) {
        case 'picked-up':
          await deliveryService.markPickedUp(details.orderId);
          break;
        case 'out-for-delivery':
          await deliveryService.markOutForDelivery(details.orderId);
          break;
        case 'delivered':
          await deliveryService.markDelivered(details.orderId);
          toast.success('Delivery completed!');
          navigate('/delivery/active');
          return;
      }
      toast.success('Status updated');
      loadDetails();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  if (loading || !details) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading delivery details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Delivery Details - {details.orderNumber}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Locations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Location (Pickup) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-primary-600" />
              Pickup Location
            </h2>
            <p className="font-medium text-gray-900 mb-2">{details.restaurant.name}</p>
            <p className="text-sm text-gray-600 mb-4">{details.restaurant.address}</p>
            
            {/* GPS Coordinates - PRIMARY FOR NAVIGATION */}
            <div className="bg-primary-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-primary-900 mb-2">
                GPS Coordinates (Use for Navigation):
              </p>
              <p className="text-sm text-gray-700 font-mono">
                {details.restaurant.latitude}, {details.restaurant.longitude}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={details.restaurant.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="primary" className="w-full flex items-center justify-center">
                  <FiNavigation className="mr-2" />
                  Open in Google Maps
                </Button>
              </a>
              <a href={`tel:${details.restaurant.phone}`}>
                <Button variant="outline" className="flex items-center">
                  <FiPhone className="mr-2" />
                  Call
                </Button>
              </a>
            </div>
          </div>

          {/* Customer Location (Delivery) - PRIMARY */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="mr-2 text-green-600" />
              Delivery Location (PRIMARY)
            </h2>
            <p className="font-medium text-gray-900 mb-2">{details.customer.name}</p>
            <p className="text-sm text-gray-600 mb-4">{details.customer.address}</p>
            
            {/* GPS Coordinates - PRIMARY FOR NAVIGATION */}
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-green-900 mb-2">
                ⭐ GPS Coordinates (PRIMARY FOR NAVIGATION):
              </p>
              <p className="text-sm text-gray-700 font-mono">
                {details.customer.latitude}, {details.customer.longitude}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={details.customer.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="primary" className="w-full flex items-center justify-center">
                  <FiNavigation className="mr-2" />
                  Navigate to Customer
                </Button>
              </a>
              <a href={`tel:${details.customer.phone}`}>
                <Button variant="outline" className="flex items-center">
                  <FiPhone className="mr-2" />
                  Call Customer
                </Button>
              </a>
            </div>
          </div>

          {/* Route Information */}
          {details.route && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {details.route.distanceKm.toFixed(2)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {details.route.estimatedTimeMinutes} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Map */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Map</h2>
            <DeliveryMap
              restaurantLocation={{
                lat: details.restaurant.latitude,
                lng: details.restaurant.longitude,
              }}
              customerLocation={{
                lat: details.customer.latitude,
                lng: details.customer.longitude,
              }}
            />
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-2">
              {details.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total:</span>
                <span>₹{details.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Actions</h2>
            <div className="space-y-3">
              {details.status === 'ACCEPTED' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleStatusUpdate('picked-up')}
                >
                  <FiCheckCircle className="mr-2" />
                  Mark as Picked Up
                </Button>
              )}
              {details.status === 'PICKED_UP' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleStatusUpdate('out-for-delivery')}
                >
                  <FiTruck className="mr-2" />
                  Out for Delivery
                </Button>
              )}
              {details.status === 'OUT_FOR_DELIVERY' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleStatusUpdate('delivered')}
                >
                  <FiCheckCircle className="mr-2" />
                  Mark as Delivered
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsPage;

