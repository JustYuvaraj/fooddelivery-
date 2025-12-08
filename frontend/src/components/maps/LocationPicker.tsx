import { useState, useCallback } from 'react';
import GoogleMap from './GoogleMap';
import Button from '@/components/common/Button';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  onCancel: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
  onLocationSelect,
  onCancel,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedLocation(location);
    }
  }, []);

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Click on the map to select location</p>
        <div className="text-sm font-mono text-gray-700">
          Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
        </div>
      </div>

      <GoogleMap
        center={selectedLocation}
        zoom={15}
        markers={[{ position: selectedLocation, label: '📍' }]}
        onMapClick={handleMapClick}
        height="400px"
      />

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm Location
        </Button>
      </div>
    </div>
  );
};

export default LocationPicker;



