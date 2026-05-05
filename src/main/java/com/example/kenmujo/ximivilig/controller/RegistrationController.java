package com.example.kenmujo.ximivilig.controller;

import com.example.kenmujo.ximivilig.dto.request.RegistrationRejectRequest;
import com.example.kenmujo.ximivilig.dto.request.RegistrationRequest;
import com.example.kenmujo.ximivilig.dto.request.SeedRequest;
import com.example.kenmujo.ximivilig.dto.response.ApiResponse;
import com.example.kenmujo.ximivilig.dto.response.RegistrationResponse;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;
import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
import com.example.kenmujo.ximivilig.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Registrations", description = "Manage tournament registrations and seeding")
public class RegistrationController {

    private final RegistrationService registrationService;

    // ── Public / Participant Endpoints ───────────────────────

    @PostMapping("/tournaments/{tournamentId}/register")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Register a team for a tournament", description = "Requires team captain role")
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerTeam(
            @PathVariable UUID tournamentId, @Valid @RequestBody RegistrationRequest request) {
        RegistrationResponse response = registrationService.registerTeam(tournamentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration submitted successfully", response));
    }

    @DeleteMapping("/tournaments/{tournamentId}/unregister/{teamId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Unregister a team from a tournament", description = "Requires team captain role")
    public ResponseEntity<ApiResponse<Void>> unregisterTeam(
            @PathVariable UUID tournamentId, @PathVariable UUID teamId) {
        registrationService.unregisterTeam(tournamentId, teamId);
        return ResponseEntity.ok(ApiResponse.success("Unregistered successfully"));
    }

    // ── Organizer / Admin Endpoints ─────────────────────────

    @GetMapping("/tournaments/{tournamentId}/registrations")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get registrations for a tournament", description = "Requires organizer role")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getRegistrations(
            @PathVariable UUID tournamentId,
            @RequestParam(required = false) RegistrationStatus status) {
        List<RegistrationResponse> responses = registrationService.getRegistrations(tournamentId, status);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PutMapping("/registrations/{id}/approve")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Approve a registration", description = "Requires organizer role")
    public ResponseEntity<ApiResponse<RegistrationResponse>> approveRegistration(
            @PathVariable UUID id) {
        RegistrationResponse response = registrationService.approveRegistration(id);
        return ResponseEntity.ok(ApiResponse.success("Registration approved", response));
    }

    @PutMapping("/registrations/{id}/reject")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Reject a registration", description = "Requires organizer role")
    public ResponseEntity<ApiResponse<RegistrationResponse>> rejectRegistration(
            @PathVariable UUID id, @Valid @RequestBody RegistrationRejectRequest request) {
        RegistrationResponse response = registrationService.rejectRegistration(id, request);
        return ResponseEntity.ok(ApiResponse.success("Registration rejected", response));
    }

    // ── Seeding ──────────────────────────────────────────────

    @PostMapping("/tournaments/{tournamentId}/seed")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Seed teams for a tournament", description = "Requires organizer role and REGISTRATION_CLOSED state")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> seedTeams(
            @PathVariable UUID tournamentId, @Valid @RequestBody List<SeedRequest> seedRequests) {
        List<TeamResponse> responses = registrationService.seedTeams(tournamentId, seedRequests);
        return ResponseEntity.ok(ApiResponse.success("Teams seeded successfully", responses));
    }
}
