package com.example.kenmujo.ximivilig.controller;

import com.example.kenmujo.ximivilig.dto.request.TeamRequest;
import com.example.kenmujo.ximivilig.dto.response.ApiResponse;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;
import com.example.kenmujo.ximivilig.service.TeamService;
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
@Tag(name = "Teams", description = "Team management within tournaments")
public class TeamController {

    private final TeamService teamService;

    // ── Tournament Scoped ────────────────────────────────────

    @GetMapping("/tournaments/{tournamentId}/teams")
    @Operation(summary = "Get all teams in a tournament")
    public ResponseEntity<ApiResponse<List<TeamResponse>>> getTeamsByTournament(
            @PathVariable UUID tournamentId) {
        List<TeamResponse> teams = teamService.getTeamsByTournamentId(tournamentId);
        return ResponseEntity.ok(ApiResponse.success(teams));
    }

    @PostMapping("/tournaments/{tournamentId}/teams")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a team for a tournament", description = "Caller becomes captain")
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
            @PathVariable UUID tournamentId, @Valid @RequestBody TeamRequest request) {
        TeamResponse response = teamService.createTeam(tournamentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team created successfully", response));
    }

    // ── Team Scoped ──────────────────────────────────────────

    @GetMapping("/teams/{id}")
    @Operation(summary = "Get team details")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamById(@PathVariable UUID id) {
        TeamResponse response = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/teams/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update team details", description = "Requires captain role")
    public ResponseEntity<ApiResponse<TeamResponse>> updateTeam(
            @PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        TeamResponse response = teamService.updateTeam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Team updated successfully", response));
    }

    // ── Team Roster ──────────────────────────────────────────

    @PostMapping("/teams/{id}/members/{userId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add a member to the team", description = "Requires captain role")
    public ResponseEntity<ApiResponse<TeamResponse>> addMember(
            @PathVariable UUID id, @PathVariable UUID userId) {
        TeamResponse response = teamService.addMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member added successfully", response));
    }

    @DeleteMapping("/teams/{id}/members/{userId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Remove a member from the team", description = "Requires captain role")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id, @PathVariable UUID userId) {
        teamService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully"));
    }
}
