package com.store.main.service;

import com.store.main.dto.request.LoginRequest;
import com.store.main.dto.request.RegisterRequest;
import com.store.main.dto.response.JwtResponse;
import com.store.main.dto.response.MessageResponse;
import com.store.main.exception.DuplicateResourceException;
import com.store.main.model.Role;
import com.store.main.model.User;
import com.store.main.model.enums.ERole;
import com.store.main.repository.RoleRepository;
import com.store.main.repository.UserRepository;
import com.store.main.security.JwtUtils;
import com.store.main.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for authentication operations (register, login).
 */
@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Authenticate user and generate JWT token.
     * @param loginRequest login credentials
     * @return JWT response with token and user details
     */
    @Transactional
    public JwtResponse login(LoginRequest loginRequest) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Get user details
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles
        );
    }

    /**
     * Register a new user.
     * @param registerRequest registration details
     * @return success message
     */
    @Transactional
    public MessageResponse register(RegisterRequest registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new DuplicateResourceException("User", "username", registerRequest.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new DuplicateResourceException("User", "email", registerRequest.getEmail());
        }

        // Create new user
        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getEmail()
        );

        // Assign roles
        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            // Default role: CUSTOMER
            Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("Error: Role CUSTOMER not found in database"));
            roles.add(customerRole);
        } else {
            // Assign requested roles
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found in database"));
                        roles.add(adminRole);
                        break;
                    case "staff":
                        Role staffRole = roleRepository.findByName(ERole.ROLE_STAFF)
                                .orElseThrow(() -> new RuntimeException("Error: Role STAFF not found in database"));
                        roles.add(staffRole);
                        break;
                    default:
                        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                                .orElseThrow(() -> new RuntimeException("Error: Role CUSTOMER not found in database"));
                        roles.add(customerRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }
}
