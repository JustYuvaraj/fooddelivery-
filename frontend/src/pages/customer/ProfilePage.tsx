import { useState, useEffect } from 'react';
import customerService from '@/services/customer.service';
import { Address, ProfileDTO } from '@/types/api.types';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiMapPin } from 'react-icons/fi';

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profileImageUrl: '',
  });
  const [addressForm, setAddressForm] = useState({
    label: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    isDefault: false,
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await customerService.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName || '',
        phone: data.phone,
        profileImageUrl: data.profileImageUrl || '',
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await customerService.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updated = await customerService.updateProfile(formData);
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await customerService.deleteAddress(addressId);
      loadAddresses();
      toast.success('Address deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    try {
      await customerService.setDefaultAddress(addressId);
      loadAddresses();
      toast.success('Default address updated');
    } catch (error: any) {
      toast.error('Failed to set default address');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!editing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <FiEdit2 className="mr-2" />
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Profile Image URL"
              value={formData.profileImageUrl}
              onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
            />
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleUpdateProfile}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">
                {profile.firstName} {profile.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{profile.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-medium">{profile.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Orders:</span>
              <span className="font-medium">{profile.totalCompletedOrders || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Delivery Addresses</h2>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddressForm(!showAddressForm)}
          >
            <FiPlus className="mr-2" />
            Add Address
          </Button>
        </div>

        {showAddressForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Note: For production, integrate Google Maps location picker to get GPS coordinates.
              For now, addresses can be managed via API.
            </p>
            <div className="space-y-3">
              <Input
                label="Label (Home, Work, etc.)"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
              />
              <Input
                label="Address Line 1"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              />
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              />
              <Input
                label="Postal Code"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
              />
              <Button
                variant="primary"
                onClick={async () => {
                  // For production: Get GPS coordinates from Google Maps
                  // For now, using placeholder coordinates
                  try {
                    await customerService.createAddress({
                      ...addressForm,
                      latitude: 28.6139, // Should come from Google Maps
                      longitude: 77.2090, // Should come from Google Maps
                    });
                    loadAddresses();
                    setShowAddressForm(false);
                    setAddressForm({
                      label: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      latitude: 0,
                      longitude: 0,
                      isDefault: false,
                    });
                    toast.success('Address added');
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to add address');
                  }
                }}
              >
                Save Address
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <FiMapPin className="mr-2 text-primary-600" />
                  <span className="font-semibold text-gray-900">{address.label}</span>
                  {address.isDefault && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-800 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-sm text-gray-700">
                  {address.city}, {address.state} {address.postalCode}
                </p>
              </div>
              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefaultAddress(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && (
          <p className="text-gray-600 text-center py-8">No addresses saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;



