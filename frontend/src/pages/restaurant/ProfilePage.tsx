import { useState, useEffect } from 'react';
import restaurantOwnerService from '@/services/restaurant-owner.service';
import { Restaurant } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: '',
    phone: '',
    email: '',
    openingTime: '',
    closingTime: '',
    minOrderAmount: '',
    deliveryRadiusKm: '',
    logoUrl: '',
    bannerUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await restaurantOwnerService.getProfile();
      setRestaurant(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        cuisineType: data.cuisineType || '',
        phone: data.phone,
        email: data.email || '',
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        minOrderAmount: data.minOrderAmount.toString(),
        deliveryRadiusKm: data.deliveryRadiusKm.toString(),
        logoUrl: data.logoUrl || '',
        bannerUrl: data.bannerUrl || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!restaurant) return;
    try {
      const updated = await restaurantOwnerService.updateProfile(restaurant.id, {
        ...formData,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
        deliveryRadiusKm: formData.deliveryRadiusKm ? Number(formData.deliveryRadiusKm) : undefined,
      });
      setRestaurant(updated);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleToggleOrderAcceptance = async () => {
    if (!restaurant) return;
    try {
      const updated = await restaurantOwnerService.updateStatus(
        restaurant.id,
        !restaurant.isAcceptingOrders
      );
      setRestaurant(updated);
      toast.success(`Now ${updated.isAcceptingOrders ? 'accepting' : 'not accepting'} orders`);
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Restaurant Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Cuisine Type"
                value={formData.cuisineType}
                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Opening Time"
                type="time"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              />
              <Input
                label="Minimum Order (₹)"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
              <Input
                label="Delivery Radius (km)"
                type="number"
                value={formData.deliveryRadiusKm}
                onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: e.target.value })}
              />
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Input
              label="Logo URL"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            />
            <Input
              label="Banner URL"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            />
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Restaurant Name</p>
                <p className="font-medium">{restaurant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cuisine Type</p>
                <p className="font-medium">{restaurant.cuisineType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{restaurant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{restaurant.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Acceptance Toggle */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Accepting Orders</p>
              <p className="text-sm text-gray-600">
                {restaurant.isAcceptingOrders ? 'Currently accepting orders' : 'Not accepting orders'}
              </p>
            </div>
            <Button
              variant={restaurant.isAcceptingOrders ? 'danger' : 'primary'}
              onClick={handleToggleOrderAcceptance}
            >
              {restaurant.isAcceptingOrders ? 'Stop Accepting' : 'Start Accepting'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;



