package com.fooddelivery.modules.customer.api;

import com.fooddelivery.modules.customer.application.CustomerService;
import com.fooddelivery.modules.customer.domain.dto.ProfileDTO;
import com.fooddelivery.modules.customer.domain.dto.UpdateProfileRequest;
import com.fooddelivery.modules.customer.domain.dto.ChangePasswordRequest;
import com.fooddelivery.modules.customer.domain.dto.AddressDTO;
import com.fooddelivery.modules.customer.domain.dto.CreateAddressRequest;
import com.fooddelivery.modules.customer.domain.dto.UpdateAddressRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/customer")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Get customer profile
     * GET /api/v1/customer/profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ProfileDTO> getProfile(Authentication authentication) {
        log.info("Fetching customer profile");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(customerService.getProfile(customerId));
    }

    /**
     * Update customer profile
     * PUT /api/v1/customer/profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ProfileDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        log.info("Updating customer profile");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(customerService.updateProfile(customerId, request));
    }

    /**
     * Change password
     * POST /api/v1/customer/change-password
     */
    @PostMapping("/change-password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        log.info("Changing customer password");
        Long customerId = extractUserIdFromAuth(authentication);
        customerService.changePassword(customerId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Get all addresses
     * GET /api/v1/customer/addresses
     */
    @GetMapping("/addresses")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AddressDTO>> getAddresses(Authentication authentication) {
        log.info("Fetching customer addresses");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(customerService.getUserAddresses(customerId));
    }

    /**
     * Create address
     * POST /api/v1/customer/addresses
     */
    @PostMapping("/addresses")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> createAddress(
            @Valid @RequestBody CreateAddressRequest request,
            Authentication authentication) {
        log.info("Creating customer address");
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createAddress(customerId, request));
    }

    /**
     * Update address
     * PUT /api/v1/customer/addresses/{addressId}
     */
    @PutMapping("/addresses/{addressId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody UpdateAddressRequest request,
            Authentication authentication) {
        log.info("Updating address: {}", addressId);
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(customerService.updateAddress(addressId, customerId, request));
    }

    /**
     * Delete address
     * DELETE /api/v1/customer/addresses/{addressId}
     */
    @DeleteMapping("/addresses/{addressId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        log.info("Deleting address: {}", addressId);
        Long customerId = extractUserIdFromAuth(authentication);
        customerService.deleteAddress(addressId, customerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Set default address
     * PATCH /api/v1/customer/addresses/{addressId}/default
     */
    @PatchMapping("/addresses/{addressId}/default")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @PathVariable Long addressId,
            Authentication authentication) {
        log.info("Setting default address: {}", addressId);
        Long customerId = extractUserIdFromAuth(authentication);
        return ResponseEntity.ok(customerService.setDefaultAddress(addressId, customerId));
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.fooddelivery.security.CustomUserDetails) {
            com.fooddelivery.security.CustomUserDetails userDetails =
                (com.fooddelivery.security.CustomUserDetails) authentication.getPrincipal();
            return userDetails.getId();
        }
        throw new IllegalStateException("Unable to extract user ID from authentication");
    }
}
