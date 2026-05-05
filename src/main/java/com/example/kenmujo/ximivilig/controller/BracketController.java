package com.example.kenmujo.ximivilig.controller;

import com.example.kenmujo.ximivilig.dto.request.MatchResultRequest;
import com.example.kenmujo.ximivilig.dto.response.ApiResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse.MatchResponse;
import com.example.kenmujo.ximivilig.dto.response.StandingResponse;
import com.example.kenmujo.ximivilig.service.BracketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Bracket", description = "Bracket generation, match management, and standings")
public class BracketController {

    private final BracketService bracketService;

    // ── Generator ────────────────────────────────────────────

    @PostMapping("/tournaments/{tournamentId}/generate-bracket")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Generate the bracket", description = "Requires organizer role and REGISTRATION_CLOSED status")
    public ResponseEntity<ApiResponse<Void>> generateBracket(@PathVariable UUID tournamentId) {
        bracketService.generateBracket(tournamentId);
        return ResponseEntity.ok(ApiResponse.success("Bracket generated and tournament started"));
    }

    // ── Viewers ──────────────────────────────────────────────

    @GetMapping("/tournaments/{tournamentId}/bracket")
    @Operation(summary = "Get the full bracket structure")
    public ResponseEntity<ApiResponse<BracketResponse>> getTournamentBracket(@PathVariable UUID tournamentId) {
        BracketResponse response = bracketService.getTournamentBracket(tournamentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/tournaments/{tournamentId}/matches")
    @Operation(summary = "Get a flat list of all matches in the tournament")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getTournamentMatches(@PathVariable UUID tournamentId) {
        List<MatchResponse> responses = bracketService.getTournamentMatches(tournamentId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/tournaments/{tournamentId}/standings")
    @Operation(summary = "Get current standings (for Round Robin formats)")
    public ResponseEntity<ApiResponse<List<StandingResponse>>> getStandings(@PathVariable UUID tournamentId) {
        List<StandingResponse> responses = bracketService.getStandings(tournamentId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // ── Match Update ─────────────────────────────────────────

    @PutMapping("/matches/{matchId}/result")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update match score and advance winner", description = "Requires organizer role")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchResult(
            @PathVariable UUID matchId, @Valid @RequestBody MatchResultRequest request) {
        MatchResponse response = bracketService.updateMatchResult(matchId, request);
        return ResponseEntity.ok(ApiResponse.success("Match result updated", response));
    }
}
