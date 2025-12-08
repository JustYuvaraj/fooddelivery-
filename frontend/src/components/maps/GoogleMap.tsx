import { useMemo } from 'react';
import { GoogleMap as GoogleMapComponent, Marker, useLoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '@/utils/constants';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    label?: string;
    icon?: string;
  }>;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  height?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 15,
  markers = [],
  onMapClick,
  height = '400px',
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  });

  const mapContainerStyle = useMemo(
    () => ({
      width: '100%',
      height,
    }),
    [height]
  );

  if (loadError) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-600">Error loading map. Please check your Google Maps API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-gray-600">Google Maps API key not configured.</p>
      </div>
    );
  }

  return (
    <GoogleMapComponent
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onClick={onMapClick}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          label={marker.label}
          icon={marker.icon}
        />
      ))}
    </GoogleMapComponent>
  );
};

export default GoogleMap;



