package com.fooddelivery.modules.customer.application;

import com.fooddelivery.modules.customer.domain.dto.ProfileDTO;
import com.fooddelivery.modules.customer.domain.dto.UpdateProfileRequest;
import com.fooddelivery.modules.customer.domain.dto.ChangePasswordRequest;
import com.fooddelivery.modules.customer.domain.dto.AddressDTO;
import com.fooddelivery.modules.customer.domain.dto.CreateAddressRequest;
import com.fooddelivery.modules.customer.domain.dto.UpdateAddressRequest;
import com.fooddelivery.model.entity.User;
import com.fooddelivery.model.entity.UserAddress;
import com.fooddelivery.model.enums.OrderStatus;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.repository.UserAddressRepository;
import com.fooddelivery.modules.order.infra.OrderRepository;
import com.fooddelivery.exception.ResourceNotFoundException;
import com.fooddelivery.exception.UnauthorizedAccessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get customer profile
     */
    @Transactional(readOnly = true)
    public ProfileDTO getProfile(Long customerId) {
        log.info("Fetching profile for customer: {}", customerId);

        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long totalOrders = (long) orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, null)
                .getNumberOfElements();
        Long completedOrders = (long) orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, null)
                .getContent().stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .count();

        return ProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalOrders(totalOrders)
                .totalCompletedOrders(completedOrders)
                .build();
    }

    /**
     * Update customer profile
     */
    public ProfileDTO updateProfile(Long customerId, UpdateProfileRequest request) {
        log.info("Updating profile for customer: {}", customerId);

        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        userRepository.save(user);
        log.info("Profile updated successfully");

        return getProfile(customerId);
    }

    /**
     * Change password
     */
    public void changePassword(Long customerId, ChangePasswordRequest request) {
        log.info("Changing password for customer: {}", customerId);

        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully");
    }

    /**
     * Create address
     */
    public AddressDTO createAddress(Long customerId, CreateAddressRequest request) {
        log.info("Creating address for customer: {}", customerId);

        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(customerId)
                    .ifPresent(defaultAddress -> {
                        defaultAddress.setIsDefault(false);
                        addressRepository.save(defaultAddress);
                    });
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        UserAddress saved = addressRepository.save(address);
        log.info("Address created with ID: {}", saved.getId());

        return mapToDTO(saved);
    }

    /**
     * Update address
     */
    public AddressDTO updateAddress(Long addressId, Long customerId, UpdateAddressRequest request) {
        log.info("Updating address: {} for customer: {}", addressId, customerId);

        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You do not have permission to update this address");
        }

        if (request.getLabel() != null) address.setLabel(request.getLabel());
        if (request.getAddressLine1() != null) address.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) address.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getLatitude() != null) address.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) address.setLongitude(request.getLongitude());

        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(customerId)
                    .ifPresent(defaultAddress -> {
                        if (!defaultAddress.getId().equals(addressId)) {
                            defaultAddress.setIsDefault(false);
                            addressRepository.save(defaultAddress);
                        }
                    });
            address.setIsDefault(true);
        }

        UserAddress updated = addressRepository.save(address);
        return mapToDTO(updated);
    }

    /**
     * Delete address
     */
    public void deleteAddress(Long addressId, Long customerId) {
        log.info("Deleting address: {} for customer: {}", addressId, customerId);

        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this address");
        }

        addressRepository.delete(address);
        log.info("Address deleted successfully");
    }

    /**
     * Get user addresses
     */
    @Transactional(readOnly = true)
    public List<AddressDTO> getUserAddresses(Long customerId) {
        log.info("Fetching addresses for customer: {}", customerId);

        return addressRepository.findByUserId(customerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Set default address
     */
    public AddressDTO setDefaultAddress(Long addressId, Long customerId) {
        log.info("Setting default address: {} for customer: {}", addressId, customerId);

        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You do not have permission to modify this address");
        }

        addressRepository.findByUserIdAndIsDefaultTrue(customerId)
                .ifPresent(defaultAddress -> {
                    defaultAddress.setIsDefault(false);
                    addressRepository.save(defaultAddress);
                });

        address.setIsDefault(true);
        UserAddress updated = addressRepository.save(address);

        return mapToDTO(updated);
    }

    /**
     * Convert UserAddress entity to DTO
     */
    private AddressDTO mapToDTO(UserAddress address) {
        return AddressDTO.builder()
                .id(address.getId())
                .label(address.getLabel())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
