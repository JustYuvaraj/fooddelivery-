import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_AGENT',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      await register(formData);
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (formData.role === 'CUSTOMER') {
        navigate('/customer');
      } else if (formData.role === 'RESTAURANT_OWNER') {
        navigate('/restaurant');
      } else if (formData.role === 'DELIVERY_AGENT') {
        navigate('/delivery');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: 'CUSTOMER', label: '🛒 Customer', description: 'Order food from restaurants' },
    { value: 'RESTAURANT_OWNER', label: '🍽️ Restaurant Owner', description: 'Manage your restaurant' },
    { value: 'DELIVERY_AGENT', label: '🚴 Delivery Agent', description: 'Deliver orders' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl mb-4">🍔</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FoodHub</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => {
                setFormData({ ...formData, firstName: e.target.value });
                if (errors.firstName) setErrors({ ...errors, firstName: '' });
              }}
              error={errors.firstName}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              error={errors.phone}
              placeholder="9876543210"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              placeholder="••••••••"
              helperText="At least 6 characters"
              required
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I want to join as <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {roles.map((roleOption) => (
                  <label
                    key={roleOption.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === roleOption.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={roleOption.value}
                      checked={formData.role === roleOption.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{roleOption.label}</p>
                      <p className="text-xs text-gray-500">{roleOption.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="block w-full text-center py-3 px-4 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors duration-200"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;



