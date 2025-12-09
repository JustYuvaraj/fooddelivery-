package com.fooddelivery.repository;

import com.fooddelivery.model.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Long userId);
    List<UserAddress> findByUserId(Long userId);
}
