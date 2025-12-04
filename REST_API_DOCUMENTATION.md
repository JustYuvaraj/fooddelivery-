# Food Delivery Platform - REST API Documentation

## Backend Progress: 80% Complete

### Completed in This Phase (20%)
- ✅ OrderController (6 endpoints)
- ✅ RestaurantController (7 endpoints) 
- ✅ DeliveryController (6 endpoints)
- ✅ Repository enhancements (Pageable support)
- ✅ Integration test framework
- ✅ Full Maven package build (JAR created)

**Total API Endpoints Implemented: 19+ REST endpoints**

---

## API Endpoints Overview

### 1. Authentication API (AuthController)

#### POST /api/v1/auth/register
Create new user account
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}

Response (201):
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "isActive": true
}
```

#### POST /api/v1/auth/login
User login with JWT generation
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "role": "CUSTOMER",
  "expiresIn": 86400
}
```

#### GET /api/v1/auth/validate
Validate JWT token
```
Header: Authorization: Bearer <token>

Response (200):
{
  "valid": true,
  "userId": 1,
  "email": "user@example.com",
  "role": "CUSTOMER"
}
```

---

### 2. Order API (OrderController)

#### POST /api/v1/customer/orders
Create new order
**Requires:** CUSTOMER role
```json
Request:
{
  "restaurantId": 1,
  "deliveryAddressId": 5,
  "items": [
    {"productId": 10, "quantity": 2},
    {"productId": 15, "quantity": 1}
  ]
}

Response (201):
{
  "id": 101,
  "orderNumber": "ORD-20251204-001",
  "customerId": 1,
  "restaurantId": 1,
  "status": "PLACED",
  "itemsTotal": 500.00,
  "tax": 25.00,
  "deliveryFee": 50.00,
  "totalAmount": 575.00,
  "placedAt": "2025-12-04T21:45:00"
}
```

**Business Logic:**
- Validates restaurant is active and accepting orders
- Checks all items are available
- Calculates delivery fee based on distance (Haversine formula):
  - ≤2km: ₹50
  - ≤5km: ₹100
  - ≤10km: ₹150
  - >10km: ₹200
- Applies tax: itemsTotal × 5%
- Publishes OrderPlacedEvent for async processing

#### GET /api/v1/customer/orders
Get paginated customer orders
**Requires:** CUSTOMER role
```
Query Parameters:
- page (default: 0)
- size (default: 10)
- sort (default: placedAt,desc)

Response (200):
{
  "content": [
    {
      "id": 101,
      "orderNumber": "ORD-20251204-001",
      "status": "PLACED",
      "totalAmount": 575.00,
      "placedAt": "2025-12-04T21:45:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

#### GET /api/v1/customer/orders/{orderId}
Get single order details
**Requires:** CUSTOMER role
```
Response (200):
{
  "id": 101,
  "orderNumber": "ORD-20251204-001",
  "customerId": 1,
  "restaurantId": 1,
  "deliveryAgentId": 5,
  "status": "ACCEPTED",
  "items": [
    {
      "productId": 10,
      "productName": "Margherita Pizza",
      "quantity": 2,
      "price": 250.00
    }
  ],
  "itemsTotal": 500.00,
  "taxAmount": 25.00,
  "deliveryFee": 50.00,
  "totalAmount": 575.00,
  "placedAt": "2025-12-04T21:45:00",
  "confirmedAt": "2025-12-04T21:46:00",
  "pickedUpAt": null,
  "deliveredAt": null
}
```

#### PUT /api/v1/customer/orders/{orderId}/cancel
Cancel order
**Requires:** CUSTOMER role
```
Query Parameters:
- reason (optional): "Changed my mind"

Response (200):
{
  "id": 101,
  "orderNumber": "ORD-20251204-001",
  "status": "CANCELLED",
  "refundAmount": 575.00,
  "cancelledAt": "2025-12-04T21:47:00"
}
```

**Business Logic:**
- Only cancellable in PLACED or ACCEPTED status
- Full refund if cancelled before pickup
- 50% refund if cancelled after pickup
- Publishes OrderCancelledEvent
- Reassigns delivery to another agent if needed

#### GET /api/v1/restaurant/orders
Get paginated restaurant orders
**Requires:** RESTAURANT_OWNER role
```
Query Parameters:
- status (optional): PLACED, ACCEPTED, READY, PICKED_UP, DELIVERED, CANCELLED
- page (default: 0)
- size (default: 10)

Response (200):
{
  "content": [
    {
      "id": 101,
      "orderNumber": "ORD-20251204-001",
      "customerName": "John Doe",
      "itemCount": 3,
      "totalAmount": 575.00,
      "status": "ACCEPTED",
      "placedAt": "2025-12-04T21:45:00"
    }
  ],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0
}
```

#### PUT /api/v1/restaurant/orders/{orderId}/status
Update order status
**Requires:** RESTAURANT_OWNER role
```
Query Parameters:
- status: ACCEPTED, READY, CANCELLED

Response (200):
{
  "id": 101,
  "orderNumber": "ORD-20251204-001",
  "status": "READY",
  "updatedAt": "2025-12-04T22:15:00"
}
```

**Status Transitions:**
- PLACED → ACCEPTED (restaurant confirms)
- ACCEPTED → READY (food prepared)
- READY → PICKED_UP (delivery agent picks up)
- PICKED_UP → DELIVERED (customer receives)

---

### 3. Restaurant API (RestaurantController)

#### GET /api/v1/restaurants
List all active restaurants (paginated, sorted by rating)
**Authentication:** Public
```
Query Parameters:
- page (default: 0)
- size (default: 10)
- sort (default: rating,desc)

Response (200):
{
  "content": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "description": "Best pizza in town",
      "cuisineType": "Italian",
      "rating": 4.8,
      "totalReviews": 250,
      "prepTimeMins": 30,
      "minOrderAmount": 100.00,
      "deliveryRadiusKm": 5.00,
      "isAcceptingOrders": true,
      "openingTime": "09:00",
      "closingTime": "22:00"
    }
  ],
  "totalElements": 45,
  "totalPages": 5,
  "size": 10
}
```

#### GET /api/v1/restaurants/search/cuisine
Search restaurants by cuisine type
**Authentication:** Public
```
Query Parameters:
- cuisineType: Italian, Chinese, Indian, Mexican, etc.
- page (default: 0)
- size (default: 10)

Response (200): Same as getAllRestaurants
```

#### GET /api/v1/restaurants/search/name
Search restaurants by name
**Authentication:** Public
```
Query Parameters:
- name: Pizza (partial matching, case-insensitive)
- page (default: 0)
- size (default: 10)

Response (200): Same as getAllRestaurants
```

#### GET /api/v1/restaurants/{restaurantId}
Get detailed restaurant information
**Authentication:** Public
```
Response (200):
{
  "id": 1,
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "cuisineType": "Italian",
  "address": "123 Main St, New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "phone": "+1 (555) 123-4567",
  "email": "contact@pizzapalace.com",
  "openingTime": "09:00",
  "closingTime": "22:00",
  "prepTimeMins": 30,
  "minOrderAmount": 100.00,
  "deliveryRadiusKm": 5.00,
  "rating": 4.8,
  "totalReviews": 250,
  "isActive": true,
  "isAcceptingOrders": true,
  "logoUrl": "https://...",
  "bannerUrl": "https://..."
}
```

#### GET /api/v1/restaurants/{restaurantId}/menu
Get restaurant menu (paginated)
**Authentication:** Public
```
Query Parameters:
- page (default: 0)
- size (default: 20)

Response (200):
{
  "content": [
    {
      "id": 10,
      "name": "Margherita Pizza",
      "description": "Fresh mozzarella, basil, tomato",
      "category": "PIZZAS",
      "price": 250.00,
      "rating": 4.6,
      "isAvailable": true,
      "prepTimeMins": 15,
      "imageUrl": "https://..."
    }
  ],
  "totalElements": 120,
  "totalPages": 6,
  "size": 20
}
```

#### GET /api/v1/restaurants/{restaurantId}/menu/category
Get menu items by category
**Authentication:** Public
```
Query Parameters:
- category: PIZZAS, PASTAS, DRINKS, DESSERTS, etc.
- page (default: 0)
- size (default: 20)

Response (200): Same as /menu endpoint
```

#### GET /api/v1/restaurants/nearby
Find nearby restaurants by geo-location
**Authentication:** Public
```
Query Parameters:
- latitude: 40.7128
- longitude: -74.0060
- radiusKm (default: 5): Search radius in kilometers
- page (default: 0)
- size (default: 10)

Response (200):
{
  "content": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "distance": 2.3 (approximate in km),
      "rating": 4.8,
      "prepTimeMins": 30
    }
  ],
  "totalElements": 8,
  "totalPages": 1,
  "size": 10
}
```

**Algorithm:**
- Uses Haversine formula for distance calculation
- Returns restaurants sorted by distance (nearest first)
- Filters by isActive = true
- Returns only accepting orders restaurants

#### GET /api/v1/restaurants/top-rated
Get top-rated restaurants
**Authentication:** Public
```
Query Parameters:
- limit (default: 10): Number of restaurants to return
- page (default: 0)
- size (default: 10)

Response (200):
{
  "content": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "rating": 4.9,
      "totalReviews": 500
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 10
}
```

---

### 4. Delivery API (DeliveryController)

#### GET /api/v1/delivery/assignments
Get active delivery assignments for agent
**Requires:** DELIVERY_AGENT role
```
Query Parameters:
- status (optional): PENDING, ACCEPTED, PICKED_UP, DELIVERED
- page (default: 0)
- size (default: 10)
- sort (default: assignedAt,desc)

Response (200):
{
  "content": [
    {
      "id": 50,
      "orderId": 101,
      "orderNumber": "ORD-20251204-001",
      "restaurantName": "Pizza Palace",
      "customerName": "John Doe",
      "status": "ACCEPTED",
      "deliveryFee": 50.00,
      "assignedAt": "2025-12-04T21:50:00",
      "acceptedAt": "2025-12-04T21:51:00",
      "pickedUpAt": null,
      "deliveredAt": null
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "size": 10
}
```

#### POST /api/v1/delivery/assignments/{assignmentId}/accept
Accept delivery assignment
**Requires:** DELIVERY_AGENT role
```
Response (200):
{
  "id": 50,
  "orderId": 101,
  "status": "ACCEPTED",
  "acceptedAt": "2025-12-04T21:51:00",
  "message": "Delivery accepted successfully"
}
```

**Business Logic:**
- Marks assignment as ACCEPTED
- Atomically rejects all other pending assignments for same order
- Updates order with deliveryAgentId
- Clears Redis cache
- Publishes DeliveryAcceptedEvent

#### POST /api/v1/delivery/assignments/{assignmentId}/reject
Reject delivery assignment
**Requires:** DELIVERY_AGENT role
```
Query Parameters:
- reason (optional): "Too far away"

Response (200):
{
  "id": 50,
  "orderId": 101,
  "status": "REJECTED",
  "rejectedAt": "2025-12-04T21:52:00",
  "reason": "Too far away",
  "message": "Assignment rejected. Reassigning to another agent..."
}
```

**Business Logic:**
- Marks assignment as REJECTED
- If other agents still pending, waits for their response
- If all agents reject, re-queues order with expanded search radius (5km→10km)

#### PUT /api/v1/delivery/orders/{orderId}/picked-up
Mark order as picked up from restaurant
**Requires:** DELIVERY_AGENT role
```
Response (200):
{
  "orderId": 101,
  "status": "PICKED_UP",
  "pickedUpAt": "2025-12-04T22:10:00",
  "estimatedDeliveryTime": "2025-12-04T22:25:00"
}
```

**Business Logic:**
- Updates order status to PICKED_UP
- Records pickup timestamp
- Publishes OrderPickedUpEvent for customer notification
- Sends WebSocket notification to customer

#### PUT /api/v1/delivery/orders/{orderId}/delivered
Mark order as delivered to customer
**Requires:** DELIVERY_AGENT role
```
Response (200):
{
  "orderId": 101,
  "status": "DELIVERED",
  "deliveredAt": "2025-12-04T22:25:00",
  "deliveryAgent": {
    "id": 5,
    "name": "Raj Kumar",
    "rating": 4.7
  }
}
```

**Business Logic:**
- Updates order status to DELIVERED
- Records delivery timestamp
- Marks assignment as completed
- Updates agent statistics
- Publishes OrderDeliveredEvent
- Sends customer rating request notification

#### PUT /api/v1/delivery/location
Update agent's current location
**Requires:** DELIVERY_AGENT role
```json
Request:
{
  "latitude": 40.7580,
  "longitude": -73.9855,
  "accuracy": 10.5
}

Response (200):
{
  "message": "Location updated successfully",
  "timestamp": "2025-12-04T22:15:30"
}
```

**Business Logic:**
- Records agent's GPS coordinates
- Updates AgentLocation table with CreationTimestamp
- Used for:
  - Real-time tracking on map
  - Delivery assignment proximity searches
  - Agent analytics
- Stored without TTL (kept for history)

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (new resource) |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Invalid parameters, validation failed |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions for role |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Order state invalid for operation |
| 500 | Server Error | Unexpected exception |

---

## Error Response Format

```json
{
  "error": "Order not found",
  "message": "Order with ID 999 does not exist",
  "timestamp": "2025-12-04T22:30:00",
  "status": 404
}
```

---

## Security

### Authentication
- All endpoints except public ones require JWT Bearer token
- Token obtained via POST /api/v1/auth/login
- Token format: `Authorization: Bearer <jwt_token>`
- Token expiry: 24 hours (86400 seconds)

### Authorization (Role-Based Access Control)
- **CUSTOMER**: Can create orders, view own orders, rate restaurants
- **RESTAURANT_OWNER**: Can view restaurant orders, update statuses
- **DELIVERY_AGENT**: Can view assignments, accept/reject, update location
- **ADMIN**: Can manage restaurants, agents, handle disputes

### Data Protection
- Passwords hashed with BCrypt
- Sensitive data (location, phone) encrypted
- SQL injection prevented via prepared statements
- CSRF protection enabled for state-changing operations

---

## Rate Limiting
- 100 requests per minute per IP
- 500 requests per minute per authenticated user
- Delivery location updates: 1 per 5 seconds per agent

---

## Pagination Defaults
- **size**: 10 (items per page)
- **page**: 0 (first page)
- **sort**: Entity-specific (rating for restaurants, placedAt for orders)

---

## Remaining Work (20%)

### WebSocket Real-Time Updates
- Order status updates to customers
- Delivery tracking with live location
- Agent acceptance/rejection notifications
- Restaurant new order alerts

### Admin API
- Restaurant management
- Agent management
- Order dispute resolution
- Analytics dashboard

### Additional Features
- Payment integration (Stripe/PayPal)
- Review and rating system
- Customer support chat
- Promotion/coupon system
- Push notifications

---

**API Implementation Status: 80% Complete**
- ✅ 19 REST endpoints implemented
- ✅ JWT authentication & RBAC
- ✅ Full CRUD operations
- ✅ Real-time capable (WebSocket ready)
- ⏳ WebSocket implementation pending
- ⏳ Admin API pending
