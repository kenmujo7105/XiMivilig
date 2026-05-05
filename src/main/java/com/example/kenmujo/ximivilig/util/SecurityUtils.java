package com.example.kenmujo.ximivilig.util;

import com.example.kenmujo.ximivilig.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Static helpers for accessing the current authenticated user from anywhere in the application.
 * Use only in service/controller layer — never in entities or repositories.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class — no instances
    }

    /**
     * Returns the UUID of the currently authenticated user.
     *
     * @throws IllegalStateException if no user is authenticated
     */
    public static UUID getCurrentUserId() {
        return getCurrentPrincipal().getId();
    }

    /**
     * Returns the {@link UserPrincipal} of the currently authenticated user.
     *
     * @throws IllegalStateException if no user is authenticated
     */
    public static UserPrincipal getCurrentUser() {
        return getCurrentPrincipal();
    }

    /**
     * Returns true if the current user has the given role (without "ROLE_" prefix).
     * Example: hasRole("ADMIN")
     */
    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Returns true if a user is currently authenticated.
     */
    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof UserPrincipal;
    }

    private static UserPrincipal getCurrentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new IllegalStateException("No authenticated user found in SecurityContext");
        }
        return principal;
    }
}
