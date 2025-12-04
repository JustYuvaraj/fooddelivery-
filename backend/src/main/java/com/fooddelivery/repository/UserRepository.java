package com.fooddelivery.repository;

import com.fooddelivery.model.entity.User;
import com.fooddelivery.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByIsOnlineAndRole(Boolean isOnline, UserRole role);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhone(String phone);
}
