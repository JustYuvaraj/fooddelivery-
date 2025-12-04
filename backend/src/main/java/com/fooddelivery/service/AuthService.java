package com.fooddelivery.service;

import com.fooddelivery.dto.request.RegisterRequest;
import com.fooddelivery.dto.response.AuthResponse;
import com.fooddelivery.exception.UnauthorizedAccessException;
import com.fooddelivery.model.entity.User;
import com.fooddelivery.model.enums.UserRole;
import com.fooddelivery.repository.UserRepository;
import com.fooddelivery.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse login(String email, String password) {
        log.info("Processing login for email: {}", email);
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UnauthorizedAccessException("User not found"));
            
            if (!user.getIsActive()) {
                throw new UnauthorizedAccessException("Account is inactive");
            }
            
            String token = jwtTokenProvider.generateToken(authentication);
            
            log.info("Login successful for user: {}", email);
            
            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().toString())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .message("Login successful")
                    .build();
            
        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for email: {}", email);
            throw new UnauthorizedAccessException("Invalid email or password");
        }
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Processing registration for email: {}", request.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UnauthorizedAccessException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(UserRole.valueOf(request.getRole()));
        user.setIsActive(true);
        user.setIsVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        log.info("User registered successfully with email: {}", request.getEmail());
        
        // Generate JWT token
        String token = jwtTokenProvider.generateTokenFromUsername(request.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().toString())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .message("Registration successful")
                .build();
    }
}
