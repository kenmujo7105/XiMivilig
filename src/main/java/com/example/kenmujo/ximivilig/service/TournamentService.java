package com.example.kenmujo.ximivilig.service;

import com.example.kenmujo.ximivilig.dto.request.TournamentRequest;
import com.example.kenmujo.ximivilig.dto.response.PageResponse;
import com.example.kenmujo.ximivilig.dto.response.TournamentResponse;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TournamentService {

    PageResponse<TournamentResponse> getAllPublicTournaments(
            TournamentStatus status, TournamentFormat format, String search, Pageable pageable);

    TournamentResponse getTournamentById(UUID id);

    TournamentResponse createTournament(TournamentRequest request);

    TournamentResponse updateTournament(UUID id, TournamentRequest request);

    void deleteTournament(UUID id);

    TournamentResponse publishTournament(UUID id);

    TournamentResponse closeRegistration(UUID id);

    TournamentResponse cancelTournament(UUID id);
}
