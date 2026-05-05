package com.example.kenmujo.ximivilig.security;

import com.example.kenmujo.ximivilig.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Utility for creating and validating JWT tokens.
 *
 * Token claims:
 *   sub  — username
 *   uid  — user UUID
 *   role — user role (e.g. "ADMIN")
 *   iat  — issued-at timestamp
 *   exp  — expiration timestamp
 */
@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final JwtProperties jwtProperties;

    // ── Token Generation ─────────────────────────────────────

    public String generateToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getExpirationMs());

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("uid", principal.getId().toString())
                .claim("role", extractRoleName(principal))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    // ── Claims Extraction ────────────────────────────────────

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(getClaims(token).get("uid", String.class));
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // ── Token Validation ─────────────────────────────────────

    /**
     * Returns true if the token signature is valid and not expired.
     * jjwt 0.12.x automatically throws ExpiredJwtException for expired tokens.
     */
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public long getExpirationMs() {
        return jwtProperties.getExpirationMs();
    }

    // ── Internal ─────────────────────────────────────────────

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String extractRoleName(UserPrincipal principal) {
        return principal.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("");
    }
}
