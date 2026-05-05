package com.example.kenmujo.ximivilig.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds app.jwt.* properties from application.yaml.
 */
@Component
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {

    /** Secret key — must be at least 32 characters for HS256. */
    private String secret;

    /** Token lifetime in milliseconds (default 24h = 86400000). */
    private long expirationMs;
}
