package com.example.kenmujo.ximivilig.controller;

import com.example.kenmujo.ximivilig.dto.request.TournamentRequest;
import com.example.kenmujo.ximivilig.dto.response.ApiResponse;
import com.example.kenmujo.ximivilig.dto.response.PageResponse;
import com.example.kenmujo.ximivilig.dto.response.TournamentResponse;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import com.example.kenmujo.ximivilig.service.TournamentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
@Tag(name = "Tournaments", description = "Tournament CRUD and state management")
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    @Operation(summary = "Get public tournaments", description = "Supports pagination and filtering")
    public ResponseEntity<ApiResponse<PageResponse<TournamentResponse>>> getAllPublicTournaments(
            @RequestParam(required = false) TournamentStatus status,
            @RequestParam(required = false) TournamentFormat format,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<TournamentResponse> response = tournamentService.getAllPublicTournaments(status, format, search, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a tournament by ID")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournamentById(@PathVariable UUID id) {
        TournamentResponse response = tournamentService.getTournamentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    @Operation(summary = "Create a new tournament", description = "Requires ORGANIZER or ADMIN role")
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(
            @Valid @RequestBody TournamentRequest request) {
        TournamentResponse response = tournamentService.createTournament(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tournament created successfully", response));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing tournament", description = "Requires owner or ADMIN role")
    public ResponseEntity<ApiResponse<TournamentResponse>> updateTournament(
            @PathVariable UUID id, @Valid @RequestBody TournamentRequest request) {
        TournamentResponse response = tournamentService.updateTournament(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tournament updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a tournament", description = "Requires owner or ADMIN role")
    public ResponseEntity<ApiResponse<Void>> deleteTournament(@PathVariable UUID id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament deleted successfully"));
    }

    // ── State Transitions ──────────────────────────────────────

    @PostMapping("/{id}/publish")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Publish a draft tournament", description = "Changes state to REGISTRATION_OPEN")
    public ResponseEntity<ApiResponse<TournamentResponse>> publishTournament(@PathVariable UUID id) {
        TournamentResponse response = tournamentService.publishTournament(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament published successfully", response));
    }

    @PostMapping("/{id}/close-registration")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Close registration", description = "Changes state to REGISTRATION_CLOSED")
    public ResponseEntity<ApiResponse<TournamentResponse>> closeRegistration(@PathVariable UUID id) {
        TournamentResponse response = tournamentService.closeRegistration(id);
        return ResponseEntity.ok(ApiResponse.success("Registration closed successfully", response));
    }

    @PostMapping("/{id}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancel a tournament")
    public ResponseEntity<ApiResponse<TournamentResponse>> cancelTournament(@PathVariable UUID id) {
        TournamentResponse response = tournamentService.cancelTournament(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament cancelled successfully", response));
    }
}
