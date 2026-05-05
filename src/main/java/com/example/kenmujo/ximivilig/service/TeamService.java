package com.example.kenmujo.ximivilig.service;

import com.example.kenmujo.ximivilig.dto.request.TeamRequest;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;

import java.util.List;
import java.util.UUID;

public interface TeamService {

    List<TeamResponse> getTeamsByTournamentId(UUID tournamentId);

    TeamResponse getTeamById(UUID id);

    TeamResponse createTeam(UUID tournamentId, TeamRequest request);

    TeamResponse updateTeam(UUID id, TeamRequest request);

    TeamResponse addMember(UUID id, UUID userId);

    void removeMember(UUID id, UUID userId);
}
