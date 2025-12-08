import GoogleMap from './GoogleMap';

interface DeliveryMapProps {
  restaurantLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  agentLocation?: { lat: number; lng: number };
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantLocation,
  customerLocation,
  agentLocation,
}) => {
  // Calculate center point
  const center = {
    lat: (restaurantLocation.lat + customerLocation.lat) / 2,
    lng: (restaurantLocation.lng + customerLocation.lng) / 2,
  };

  const markers = [
    {
      position: restaurantLocation,
      label: 'R', // Restaurant
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    },
    {
      position: customerLocation,
      label: 'C', // Customer
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    },
  ];

  if (agentLocation) {
    markers.push({
      position: agentLocation,
      label: 'A', // Agent
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      <GoogleMap center={center} zoom={13} markers={markers} height="500px" />
      
      {/* Legend */}
      <div className="bg-white p-4 border-t flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <img
            src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            alt="Restaurant"
            className="w-4 h-4"
          />
          <span className="text-gray-600">Restaurant</span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            alt="Customer"
            className="w-4 h-4"
          />
          <span className="text-gray-600">Customer</span>
        </div>
        {agentLocation && (
          <div className="flex items-center gap-2">
            <img
              src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              alt="Agent"
              className="w-4 h-4"
            />
            <span className="text-gray-600">Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap;



