# Backend Refactoring Guide: Scalable Modular Architecture

## Overview

This document outlines the backend refactoring initiative to transform the Food Delivery application from a monolithic, flat structure into a **scalable, modular, domain-driven architecture**. The refactoring addresses design issues, improves code maintainability, and follows Google-level backend engineering standards.

---

## 1. Problems Identified & Fixed

### 1.1 Critical Bugs

#### **Invalid JPQL Query with `LIMIT`**
- **File**: `RestaurantRepository.java`
- **Issue**: The query used `LIMIT :limit` which is not standard JPQL and causes runtime errors.
- **Fix**: Replaced with a proper pageable method:
  ```java
  Page<Restaurant> findByIsActiveTrueAndIsAcceptingOrdersTrue(Pageable pageable);
  ```
- **Impact**: Top-rated restaurants endpoint now works correctly with proper pagination.

#### **Broken Filter Logic in `getCustomerOrdersFiltered`**
- **File**: `OrderService.java`
- **Issue**: Filters were applied in-memory but then discarded; the method returned unfiltered results.
- **Fix**: Now correctly maps filtered orders to DTOs and returns them in a proper `Page` object.
- **Impact**: Customer order filtering by status and date range now works as expected.

### 1.2 Design Issues

#### **Field Injection Anti-Pattern**
- **Issue**: Widespread use of `@Autowired` on fields instead of constructor injection.
- **Services Refactored**:
  - `RestaurantService`
  - `OrderService`
  - `CustomerController`
  - `AuthService` (pending)
  - `ProfileService` (pending)
  - `AddressService` (pending)
  - `ReviewService` (pending)
  - `FavoriteService` (pending)
  - `NotificationService` (pending)
  - `LocationTrackingService` (pending)
  - `DeliveryAssignmentService` (pending)
  - `AnalyticsService` (pending)
- **Fix**: Converted to constructor-based DI using Lombok's `@RequiredArgsConstructor`.
- **Benefit**: Better testability, immutability, and explicit dependencies.

#### **DRY Violation: Duplicated Distance Calculation**
- **Issue**: Haversine formula duplicated in `RestaurantService` and `OrderService`.
- **Fix**: Extracted into a shared utility class `GeoUtils.haversineDistance()`.
- **Files**:
  - `util/GeoUtils.java` (new)
  - `service/RestaurantService.java` (updated)
  - `service/OrderService.java` (updated)
- **Benefit**: Single source of truth for geographic calculations, easier to test and maintain.

#### **Monolithic Services**
- **Issue**: Large, fat service classes handling multiple concerns.
- **Example**: `OrderService` (457 lines) handles order creation, status updates, filtering, reordering, and DTO mapping.
- **Solution**: Modularize into domain-driven packages (see Section 2).

---

## 2. New Modular Architecture

### 2.1 Package Structure

The backend is being reorganized into **domain-driven modules** under `com.fooddelivery.modules`:

```
com.fooddelivery.modules/
├── order/
│   ├── api/                    # REST controllers
│   │   └── OrderController.java
│   ├── application/            # Use cases / business logic
│   │   └── OrderService.java
│   ├── domain/                 # Domain models, DTOs, events
│   │   ├── dto/
│   │   │   ├── OrderDTO.java
│   │   │   ├── CreateOrderRequest.java
│   │   │   ├── OrderItemRequest.java
│   │   │   └── OrderItemDTO.java
│   │   └── event/
│   │       ├── OrderPlacedEvent.java
│   │       ├── OrderStatusChangedEvent.java
│   │       └── OrderCancelledEvent.java
│   └── infra/                  # Data access layer
│       └── OrderRepository.java
│
├── restaurant/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infra/
│
├── customer/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infra/
│
├── delivery/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infra/
│
├── analytics/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infra/
│
└── notification/
    ├── api/
    ├── application/
    ├── domain/
    └── infra/

com.fooddelivery.common/
├── error/                      # Global exception handling
├── mapping/                    # MapStruct mappers (future)
├── geo/                        # Shared geographic utilities
│   └── GeoUtils.java
└── security/                   # Auth & JWT (existing)

com.fooddelivery.config/        # Spring configuration (existing)
com.fooddelivery.model/         # Shared entities (existing)
```

### 2.2 Layer Responsibilities

#### **API Layer** (`api/`)
- REST controllers
- Request/response handling
- HTTP status codes
- Authentication/authorization checks
- Example: `OrderController.java`

#### **Application Layer** (`application/`)
- Business logic and use cases
- Service classes
- Transaction management
- Orchestration of domain logic
- Example: `OrderService.java`

#### **Domain Layer** (`domain/`)
- DTOs (Data Transfer Objects)
- Request/Response models
- Domain events
- Business rules and validations
- Example: `OrderDTO.java`, `OrderPlacedEvent.java`

#### **Infrastructure Layer** (`infra/`)
- Data access (repositories)
- External service integrations
- Persistence logic
- Example: `OrderRepository.java`

---

## 3. Completed Refactors

### 3.1 Shared Utilities

#### **GeoUtils** (New)
- **File**: `util/GeoUtils.java`
- **Purpose**: Centralized geographic calculations
- **Methods**:
  - `haversineDistance(lat1, lon1, lat2, lon2)` — Calculates distance between two coordinates
- **Usage**: `RestaurantService`, `OrderService`, `DeliveryAssignmentService`

### 3.2 Repository Updates

#### **RestaurantRepository**
- **Removed**: Invalid `findTopRatedRestaurants(int limit)` with JPQL `LIMIT`
- **Added**: `findByIsActiveTrueAndIsAcceptingOrdersTrue(Pageable pageable)`
- **Benefit**: Proper pagination support, database-level sorting

### 3.3 Service Refactors

#### **RestaurantService**
- **DI**: Converted to constructor-based with `@RequiredArgsConstructor`
- **Distance**: Now uses `GeoUtils.haversineDistance()`
- **Top-Rated**: Fixed to use pageable query instead of invalid JPQL

#### **OrderService**
- **DI**: Converted to constructor-based with `@RequiredArgsConstructor`
- **Distance**: Now uses `GeoUtils.haversineDistance()`
- **Filtering**: Fixed `getCustomerOrdersFiltered()` to actually apply filters
- **Code Quality**: Cleaner, more testable

#### **CustomerController**
- **DI**: Converted to constructor-based with `@RequiredArgsConstructor`
- **Benefit**: Cleaner dependency declaration

### 3.4 New Modular Order Module

#### **OrderController** (New)
- **File**: `modules/order/api/OrderController.java`
- **Endpoints**:
  - `POST /api/v1/orders` — Create order
  - `GET /api/v1/orders/{orderId}` — Get order details
  - `GET /api/v1/orders/customer/my-orders` — Customer's orders
  - `GET /api/v1/orders/customer/filtered` — Filtered customer orders
  - `PATCH /api/v1/orders/{orderId}/status` — Update status
  - `POST /api/v1/orders/{orderId}/cancel` — Cancel order
  - `POST /api/v1/orders/{orderId}/reorder` — Reorder
  - `GET /api/v1/orders/restaurant/my-orders` — Restaurant's orders
  - `GET /api/v1/orders/delivery/my-orders` — Delivery agent's orders
- **Features**: Role-based access control, comprehensive error handling

#### **OrderService** (Modularized)
- **File**: `modules/order/application/OrderService.java`
- **Methods**: All order-related business logic
- **DI**: Constructor-based, clean dependencies
- **Events**: Publishes domain events for async processing

#### **DTOs & Events** (New)
- `OrderDTO.java` — Order data transfer object
- `CreateOrderRequest.java` — Order creation request
- `OrderItemRequest.java` — Order item request
- `OrderItemDTO.java` — Order item DTO
- `OrderPlacedEvent.java` — Domain event
- `OrderStatusChangedEvent.java` — Domain event
- `OrderCancelledEvent.java` — Domain event

#### **OrderRepository** (Modularized)
- **File**: `modules/order/infra/OrderRepository.java`
- **Purpose**: Data access for orders
- **Methods**: All order queries (unchanged from original)

---

## 4. Migration Path

### Phase 1: ✅ Completed
- [x] Fix critical bugs (JPQL `LIMIT`, filter logic)
- [x] Extract shared utilities (`GeoUtils`)
- [x] Refactor key services to constructor DI (`RestaurantService`, `OrderService`)
- [x] Create modular Order module as a template

### Phase 2: In Progress
- [ ] Refactor remaining services to constructor DI
  - `AuthService`
  - `ProfileService`
  - `AddressService`
  - `ReviewService`
  - `FavoriteService`
  - `NotificationService`
  - `LocationTrackingService`
  - `DeliveryAssignmentService`
  - `AnalyticsService`

### Phase 3: Pending
- [ ] Create modular Restaurant module
- [ ] Create modular Customer module
- [ ] Create modular Delivery module
- [ ] Create modular Analytics module
- [ ] Create modular Notification module
- [ ] Implement MapStruct mappers for DTO conversions
- [ ] Add comprehensive integration tests
- [ ] Update API documentation

### Phase 4: Optimization
- [ ] Implement Specification API for complex queries
- [ ] Add caching layer (Redis)
- [ ] Performance tuning and monitoring
- [ ] Security hardening

---

## 5. Best Practices Applied

### 5.1 Dependency Injection
- **Standard**: Constructor-based DI with `@RequiredArgsConstructor`
- **Benefit**: Immutable dependencies, easier testing, explicit contracts

### 5.2 Code Organization
- **Pattern**: Domain-driven design with clear layer separation
- **Benefit**: Easier to navigate, understand, and extend

### 5.3 Error Handling
- **Standard**: Custom exceptions (`ResourceNotFoundException`, `UnauthorizedAccessException`)
- **Benefit**: Consistent error responses, clear error semantics

### 5.4 Logging
- **Standard**: SLF4j with Lombok's `@Slf4j`
- **Benefit**: Structured logging, easy to trace execution flow

### 5.5 Transactions
- **Standard**: `@Transactional` at service layer
- **Benefit**: Automatic transaction management, clear transaction boundaries

### 5.6 Validation
- **Standard**: Jakarta validation annotations (`@NotNull`, `@Valid`, etc.)
- **Benefit**: Declarative validation, consistent error messages

---

## 6. Testing Strategy

### Unit Tests
- Test individual service methods in isolation
- Mock repositories and external dependencies
- Example: `OrderServiceTest.java`

### Integration Tests
- Test complete workflows (e.g., order creation → status update → delivery)
- Use `@SpringBootTest` with test containers
- Example: `OrderControllerIntegrationTest.java`

### API Tests
- Test REST endpoints with various payloads
- Verify HTTP status codes and response formats
- Example: `OrderControllerApiTest.java`

---

## 7. Future Enhancements

### 7.1 MapStruct Integration
- Replace manual `mapToDTO()` methods with MapStruct mappers
- Benefit: Less boilerplate, better performance

### 7.2 Specification API
- Replace manual filtering with Spring Data JPA Specifications
- Benefit: Type-safe, composable queries

### 7.3 Event-Driven Architecture
- Implement event listeners for domain events
- Benefit: Decoupled components, better scalability

### 7.4 API Documentation
- Add Springdoc OpenAPI (Swagger) annotations
- Benefit: Auto-generated API docs, better developer experience

### 7.5 Performance Optimization
- Add query result caching
- Implement pagination for large result sets
- Benefit: Faster response times, reduced database load

---

## 8. Code Quality Metrics

### Before Refactoring
- **Duplication**: Haversine formula duplicated in 2 services
- **DI Style**: 100% field injection (`@Autowired`)
- **Bugs**: Invalid JPQL query, broken filter logic
- **Module Cohesion**: Low (all code in flat `service/`, `controller/`, `repository/` packages)

### After Refactoring
- **Duplication**: 0 (extracted to `GeoUtils`)
- **DI Style**: 100% constructor injection (in refactored classes)
- **Bugs**: 2 critical bugs fixed
- **Module Cohesion**: High (domain-driven packages with clear responsibilities)

---

## 9. How to Use This Guide

1. **For New Features**: Follow the Order module structure as a template
2. **For Bug Fixes**: Check if the bug is in a refactored module; if not, apply the same patterns
3. **For Code Reviews**: Verify that new code follows the modular structure and best practices
4. **For Onboarding**: Use this guide to understand the architecture and code organization

---

## 10. Troubleshooting

### Issue: IDE shows import errors after refactoring
**Solution**: Rebuild the project (`mvn clean install` or IDE rebuild)

### Issue: Tests fail after moving classes
**Solution**: Update test imports and verify test data setup

### Issue: Runtime errors about missing beans
**Solution**: Ensure Spring can scan the new module packages; add `@ComponentScan` if needed

---

## 11. Contact & Support

For questions or clarifications about the refactoring:
- Review this document
- Check the inline code comments
- Refer to the original service implementations for business logic details

---

**Last Updated**: December 5, 2025  
**Status**: Phase 1 Complete, Phase 2 In Progress  
**Next Review**: After Phase 2 completion
