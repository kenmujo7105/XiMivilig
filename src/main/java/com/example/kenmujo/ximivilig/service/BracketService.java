package com.example.kenmujo.ximivilig.service;

import com.example.kenmujo.ximivilig.dto.request.MatchResultRequest;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse.MatchResponse;
import com.example.kenmujo.ximivilig.dto.response.StandingResponse;

import java.util.List;
import java.util.UUID;

public interface BracketService {

    void generateBracket(UUID tournamentId);

    MatchResponse updateMatchResult(UUID matchId, MatchResultRequest request);

    BracketResponse getTournamentBracket(UUID tournamentId);

    List<MatchResponse> getTournamentMatches(UUID tournamentId);

    List<StandingResponse> getStandings(UUID tournamentId);
}
