package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.dto.request.TournamentRequest;
import com.example.kenmujo.ximivilig.dto.response.PageResponse;
import com.example.kenmujo.ximivilig.dto.response.TournamentResponse;
import com.example.kenmujo.ximivilig.entity.Tournament;
import com.example.kenmujo.ximivilig.entity.User;
import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import com.example.kenmujo.ximivilig.exception.BadRequestException;
import com.example.kenmujo.ximivilig.exception.InvalidStateException;
import com.example.kenmujo.ximivilig.exception.ResourceNotFoundException;
import com.example.kenmujo.ximivilig.exception.UnauthorizedAccessException;
import com.example.kenmujo.ximivilig.repository.RegistrationRepository;
import com.example.kenmujo.ximivilig.repository.TournamentRepository;
import com.example.kenmujo.ximivilig.repository.UserRepository;
import com.example.kenmujo.ximivilig.service.TournamentService;
import com.example.kenmujo.ximivilig.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TournamentResponse> getAllPublicTournaments(
            TournamentStatus status, TournamentFormat format, String search, Pageable pageable) {
        String searchStr = (search != null && !search.isBlank()) ? search : null;
        Page<Tournament> tournaments = tournamentRepository.searchPublicTournaments(status, format, searchStr, pageable);
        return PageResponse.of(tournaments.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public TournamentResponse getTournamentById(UUID id) {
        Tournament tournament = getTournamentEntity(id);
        return mapToResponse(tournament);
    }

    @Override
    @Transactional
    public TournamentResponse createTournament(TournamentRequest request) {
        validateDates(request);
        validateParticipants(request);

        User currentUser = getCurrentUser();

        Tournament tournament = Tournament.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .game(request.getGame())
                .format(request.getFormat())
                .maxParticipants(request.getMaxParticipants())
                .minParticipants(request.getMinParticipants())
                .registrationStartAt(request.getRegistrationStartAt())
                .registrationEndAt(request.getRegistrationEndAt())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .isPublic(request.getIsPublic())
                .status(TournamentStatus.DRAFT)
                .createdBy(currentUser)
                .build();

        return mapToResponse(tournamentRepository.save(tournament));
    }

    @Override
    @Transactional
    public TournamentResponse updateTournament(UUID id, TournamentRequest request) {
        Tournament tournament = getTournamentEntity(id);
        checkOwnership(tournament);

        if (tournament.getStatus() == TournamentStatus.IN_PROGRESS ||
            tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new InvalidStateException("Cannot update a tournament that is " + tournament.getStatus());
        }

        validateDates(request);
        validateParticipants(request);

        tournament.setTitle(request.getTitle());
        tournament.setDescription(request.getDescription());
        tournament.setGame(request.getGame());
        tournament.setFormat(request.getFormat());
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setMinParticipants(request.getMinParticipants());
        tournament.setRegistrationStartAt(request.getRegistrationStartAt());
        tournament.setRegistrationEndAt(request.getRegistrationEndAt());
        tournament.setStartAt(request.getStartAt());
        tournament.setEndAt(request.getEndAt());
        tournament.setIsPublic(request.getIsPublic());

        return mapToResponse(tournamentRepository.save(tournament));
    }

    @Override
    @Transactional
    public void deleteTournament(UUID id) {
        Tournament tournament = getTournamentEntity(id);
        checkOwnership(tournament);
        
        if (tournament.getStatus() == TournamentStatus.IN_PROGRESS) {
            throw new InvalidStateException("Cannot delete a tournament in progress. Cancel it first.");
        }
        
        tournamentRepository.delete(tournament);
    }

    @Override
    @Transactional
    public TournamentResponse publishTournament(UUID id) {
        Tournament tournament = getTournamentEntity(id);
        checkOwnership(tournament);

        if (tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new InvalidStateException("Only DRAFT tournaments can be published");
        }

        tournament.setStatus(TournamentStatus.REGISTRATION_OPEN);
        return mapToResponse(tournamentRepository.save(tournament));
    }

    @Override
    @Transactional
    public TournamentResponse closeRegistration(UUID id) {
        Tournament tournament = getTournamentEntity(id);
        checkOwnership(tournament);

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN) {
            throw new InvalidStateException("Tournament registration is not open");
        }

        tournament.setStatus(TournamentStatus.REGISTRATION_CLOSED);
        return mapToResponse(tournamentRepository.save(tournament));
    }

    @Override
    @Transactional
    public TournamentResponse cancelTournament(UUID id) {
        Tournament tournament = getTournamentEntity(id);
        checkOwnership(tournament);

        if (tournament.getStatus() == TournamentStatus.COMPLETED) {
            throw new InvalidStateException("Cannot cancel a completed tournament");
        }

        tournament.setStatus(TournamentStatus.CANCELLED);
        return mapToResponse(tournamentRepository.save(tournament));
    }

    // ── Internal Helpers ─────────────────────────────────────

    private Tournament getTournamentEntity(UUID id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", "id", id));
    }

    private User getCurrentUser() {
        return userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new UnauthorizedAccessException("Current user not found"));
    }

    private void checkOwnership(Tournament tournament) {
        if (!SecurityUtils.hasRole("ADMIN") &&
            !tournament.getCreatedBy().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("You do not have permission to modify this tournament");
        }
    }

    private void validateDates(TournamentRequest request) {
        if (request.getStartAt() != null && request.getEndAt() != null) {
            if (request.getStartAt().isAfter(request.getEndAt())) {
                throw new BadRequestException("Start time must be before end time");
            }
        }
        if (request.getRegistrationStartAt() != null && request.getRegistrationEndAt() != null) {
            if (request.getRegistrationStartAt().isAfter(request.getRegistrationEndAt())) {
                throw new BadRequestException("Registration start time must be before registration end time");
            }
        }
        if (request.getRegistrationEndAt() != null && request.getStartAt() != null) {
            if (request.getRegistrationEndAt().isAfter(request.getStartAt())) {
                throw new BadRequestException("Registration must end before the tournament starts");
            }
        }
    }

    private void validateParticipants(TournamentRequest request) {
        if (request.getMinParticipants() > request.getMaxParticipants()) {
            throw new BadRequestException("Min participants cannot be greater than max participants");
        }

        if (request.getFormat() == TournamentFormat.SINGLE_ELIMINATION || 
            request.getFormat() == TournamentFormat.DOUBLE_ELIMINATION) {
            // Check if maxParticipants is a power of 2
            int n = request.getMaxParticipants();
            if ((n & (n - 1)) != 0) {
                throw new BadRequestException("For elimination formats, max participants must be a power of 2 (2, 4, 8, 16...)");
            }
        }
    }

    private TournamentResponse mapToResponse(Tournament tournament) {
        long registeredTeams = 0;
        if (tournament.getId() != null) {
            registeredTeams = registrationRepository.countByTournamentIdAndStatus(
                    tournament.getId(), RegistrationStatus.APPROVED);
        }

        return TournamentResponse.builder()
                .id(tournament.getId())
                .title(tournament.getTitle())
                .description(tournament.getDescription())
                .game(tournament.getGame())
                .format(tournament.getFormat())
                .status(tournament.getStatus())
                .maxParticipants(tournament.getMaxParticipants())
                .minParticipants(tournament.getMinParticipants())
                .registrationStartAt(tournament.getRegistrationStartAt())
                .registrationEndAt(tournament.getRegistrationEndAt())
                .startAt(tournament.getStartAt())
                .endAt(tournament.getEndAt())
                .isPublic(tournament.getIsPublic())
                .createdById(tournament.getCreatedBy().getId())
                .createdByUsername(tournament.getCreatedBy().getUsername())
                .registeredTeamsCount(registeredTeams)
                .createdAt(tournament.getCreatedAt())
                .updatedAt(tournament.getUpdatedAt())
                .build();
    }
}
