package com.fooddelivery.security;

import com.fooddelivery.model.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {
    
    private final Long id;
    private final String email;
    private final String password;
    private final String role;
    private final Boolean isActive;
    private final Collection<? extends GrantedAuthority> authorities;
    
    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRole().toString();
        this.isActive = user.getIsActive();
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().toString())
        );
    }
    
    public Long getId() {
        return id;
    }
    
    public String getRole() {
        return role;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
