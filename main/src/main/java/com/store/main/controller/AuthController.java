package com.store.main.controller;

import com.store.main.dto.request.LoginRequest;
import com.store.main.dto.request.RegisterRequest;
import com.store.main.dto.response.JwtResponse;
import com.store.main.dto.response.MessageResponse;
import com.store.main.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Handles user registration and login.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * User login endpoint.
     * POST /api/auth/login
     *
     * @param loginRequest login credentials
     * @return JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * User registration endpoint.
     * POST /api/auth/register
     *
     * @param registerRequest registration details
     * @return success message
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        MessageResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }
}
