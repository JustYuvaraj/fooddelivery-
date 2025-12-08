# FoodHub Frontend - Quick Start Guide

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Server runs at: `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🎯 Key Features

### Authentication
- **Login**: Email + Password
- **Registration**: Support for 3 roles (Customer, Restaurant Owner, Delivery Agent)
- **Protected Routes**: Role-based access control
- **Token Management**: JWT stored in localStorage

### Demo Credentials
```
Email: customer@test.com
Password: password123
```

---

## 📦 Component Library

### Common Components

#### Button
```typescript
<Button 
  variant="primary" // primary | secondary | outline | danger | ghost
  size="md" // sm | md | lg
  fullWidth={false}
  isLoading={false}
  onClick={() => {}}
>
  Click me
</Button>
```

#### Input
```typescript
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="We'll never share your email"
  required
  onChange={(e) => {}}
/>
```

#### PageLoader
```typescript
<PageLoader message="Loading your orders..." />
```

---

## 🎨 Styling Guide

### Using Tailwind Classes
```typescript
// Spacing
<div className="p-4 m-2 gap-3">

// Colors
<div className="bg-primary-600 text-white">
<div className="bg-secondary-500 text-gray-900">

// Responsive
<div className="hidden md:block lg:flex">

// Shadows
<div className="shadow-sm hover:shadow-lg">
```

### Custom Theme Colors
```javascript
// tailwind.config.js
primary: { 50: '#fef2f2', ..., 600: '#dc2626' }
secondary: { 50: '#fff7ed', ..., 600: '#ea580c' }
```

---

## 📁 File Structure

### Pages
- `pages/auth/` - Login, Register
- `pages/customer/` - Customer dashboard, restaurants, cart, checkout, orders, profile
- `pages/restaurant/` - Restaurant owner dashboard
- `pages/delivery/` - Delivery agent app

### Components
- `components/common/` - Reusable UI components
- `components/layout/` - Page layouts
- `components/maps/` - Map-related components

### Services
- `services/auth.service.ts` - Authentication API
- `services/customer.service.ts` - Customer operations
- `services/restaurant.service.ts` - Restaurant data
- `services/order.service.ts` - Order management

### Contexts
- `AuthContext` - User authentication state
- `CartContext` - Shopping cart state
- `NotificationContext` - Real-time notifications

---

## 🔌 API Integration

### Base URL
```typescript
// .env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=http://localhost:8080
```

### Making API Calls
```typescript
import apiClient from '@/utils/api';

// GET
const data = await apiClient.get('/endpoint');

// POST
const response = await apiClient.post('/endpoint', { data });

// PUT
const updated = await apiClient.put('/endpoint/id', { data });

// DELETE
await apiClient.delete('/endpoint/id');
```

### Error Handling
```typescript
try {
  const data = await apiClient.get('/endpoint');
} catch (error: any) {
  const message = error.response?.data?.message || 'Error occurred';
  toast.error(message);
}
```

---

## 🧪 Form Validation Examples

### Login Form
```typescript
const validateForm = () => {
  const errors: { email?: string; password?: string } = {};
  
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
    errors.email = 'Invalid email format';
    
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) 
    errors.password = 'Password must be at least 6 characters';
    
  return errors;
};
```

### Register Form
```typescript
const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!firstName.trim()) errors.firstName = 'First name is required';
  if (!email) errors.email = 'Email is required';
  if (!phone) errors.phone = 'Phone is required';
  else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) 
    errors.phone = 'Phone must be 10 digits';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) 
    errors.password = 'Password must be at least 6 characters';
    
  return errors;
};
```

---

## 🔐 Authentication Flow

### Login
```typescript
const { login } = useAuth();

try {
  await login(email, password);
  // User is authenticated, redirect based on role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'CUSTOMER') navigate('/customer');
} catch (error) {
  toast.error('Login failed');
}
```

### Protected Routes
```typescript
<Route
  path="/customer/*"
  element={
    <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]}>
      <CustomerHomePage />
    </ProtectedRoute>
  }
/>
```

---

## 🛒 Cart Management

### Using Cart Context
```typescript
const { items, addItem, removeItem, updateQuantity, getTotal } = useCart();

// Add item
addItem(product, quantity, specialRequests);

// Remove item
removeItem(productId);

// Update quantity
updateQuantity(productId, newQuantity);

// Get total
const total = getTotal();
```

---

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Example
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🎯 Common Tasks

### Add New Page
1. Create file in `pages/` directory
2. Add route in appropriate layout or App.tsx
3. Use Suspense with lazy loading for code splitting

### Add New Component
1. Create in `components/common/` or `components/layout/`
2. Export as default
3. Use in pages or other components

### Add New Service
1. Create in `services/` directory
2. Use `apiClient` for HTTP requests
3. Export as singleton instance

### Add Toast Notification
```typescript
import { toast } from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
```

---

## 🐛 Debugging

### Check Console
```bash
# Browser DevTools Console
# Look for errors and warnings
```

### Check Network
```bash
# Browser DevTools Network tab
# Verify API calls and responses
```

### Check State
```typescript
// Add console logs
console.log('User:', user);
console.log('Cart items:', items);
console.log('Errors:', errors);
```

### Check LocalStorage
```javascript
// Browser DevTools Console
localStorage.getItem('token');
localStorage.getItem('user');
localStorage.getItem('cart');
```

---

## 📚 Useful Links

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Axios](https://axios-http.com)
- [React Hook Form](https://react-hook-form.com)
- [React Hot Toast](https://react-hot-toast.com)

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set in `.env`
- [ ] API base URL configured correctly
- [ ] Build completes without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] All pages are accessible
- [ ] Forms validate correctly
- [ ] API calls work properly
- [ ] Responsive design tested on mobile
- [ ] Authentication flow tested
- [ ] Error handling works

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### API Connection Failed
```bash
# Check if backend is running
# Verify API_BASE_URL in .env
# Check CORS settings on backend
```

### Build Fails
```bash
# Check for TypeScript errors
npm run build

# Clear cache
rm -rf dist
npm run build
```

---

**Happy Coding! 🚀**
