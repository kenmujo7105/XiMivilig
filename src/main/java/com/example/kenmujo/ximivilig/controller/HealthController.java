package com.example.kenmujo.ximivilig.controller;

import com.example.kenmujo.ximivilig.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check endpoint to verify the API is running.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "API health check")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Check API health", description = "Returns API status and version info")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        Map<String, String> info = Map.of(
                "status", "UP",
                "name", "Tournament Management API",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success("API is running", info));
    }
}
