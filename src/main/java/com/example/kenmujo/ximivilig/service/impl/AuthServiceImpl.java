package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.dto.request.LoginRequest;
import com.example.kenmujo.ximivilig.dto.request.RegisterRequest;
import com.example.kenmujo.ximivilig.dto.response.AuthResponse;
import com.example.kenmujo.ximivilig.entity.User;
import com.example.kenmujo.ximivilig.enums.Role;
import com.example.kenmujo.ximivilig.exception.DuplicateResourceException;
import com.example.kenmujo.ximivilig.repository.UserRepository;
import com.example.kenmujo.ximivilig.security.JwtUtil;
import com.example.kenmujo.ximivilig.security.UserPrincipal;
import com.example.kenmujo.ximivilig.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Duplicate checks
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        // Determine role — ADMIN cannot be self-assigned
        Role role = (request.getRole() != null && request.getRole() != Role.ADMIN)
                ? request.getRole()
                : Role.PLAYER;

        // Build and save user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User saved = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.from(saved);
        String token = jwtUtil.generateToken(principal);

        return buildAuthResponse(principal, saved, token);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // AuthenticationManager handles credential verification + UsernameNotFoundException
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow();

        String token = jwtUtil.generateToken(principal);
        return buildAuthResponse(principal, user, token);
    }

    // ── Helpers ──────────────────────────────────────────────

    private AuthResponse buildAuthResponse(UserPrincipal principal, User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .userId(principal.getId())
                .username(principal.getUsername())
                .email(principal.getEmail())
                .role(user.getRole())
                .expiresIn(jwtUtil.getExpirationMs())
                .build();
    }
}
