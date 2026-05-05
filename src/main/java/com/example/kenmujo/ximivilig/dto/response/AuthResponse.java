package com.example.kenmujo.ximivilig.dto.response;

import com.example.kenmujo.ximivilig.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private UUID userId;
    private String username;
    private String email;
    private Role role;
    private long expiresIn; // milliseconds
}
