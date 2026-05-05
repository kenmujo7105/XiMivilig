package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.dto.request.RegistrationRejectRequest;
import com.example.kenmujo.ximivilig.dto.request.RegistrationRequest;
import com.example.kenmujo.ximivilig.dto.request.SeedRequest;
import com.example.kenmujo.ximivilig.dto.response.RegistrationResponse;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;
import com.example.kenmujo.ximivilig.entity.Registration;
import com.example.kenmujo.ximivilig.entity.Team;
import com.example.kenmujo.ximivilig.entity.Tournament;
import com.example.kenmujo.ximivilig.entity.User;
import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import com.example.kenmujo.ximivilig.exception.BadRequestException;
import com.example.kenmujo.ximivilig.exception.DuplicateResourceException;
import com.example.kenmujo.ximivilig.exception.InvalidStateException;
import com.example.kenmujo.ximivilig.exception.ResourceNotFoundException;
import com.example.kenmujo.ximivilig.exception.UnauthorizedAccessException;
import com.example.kenmujo.ximivilig.repository.RegistrationRepository;
import com.example.kenmujo.ximivilig.repository.TeamRepository;
import com.example.kenmujo.ximivilig.repository.TournamentRepository;
import com.example.kenmujo.ximivilig.repository.UserRepository;
import com.example.kenmujo.ximivilig.service.RegistrationService;
import com.example.kenmujo.ximivilig.service.TeamService;
import com.example.kenmujo.ximivilig.service.EmailService;
import com.example.kenmujo.ximivilig.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamService teamService; // Reusing to map response
    private final EmailService emailService;

    @Override
    @Transactional
    public RegistrationResponse registerTeam(UUID tournamentId, RegistrationRequest request) {
        Tournament tournament = getTournamentEntity(tournamentId);

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN) {
            throw new InvalidStateException("Registration is currently not open for this tournament");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", request.getTeamId()));

        if (!team.getTournament().getId().equals(tournamentId)) {
            throw new BadRequestException("Team does not belong to this tournament");
        }

        if (!SecurityUtils.hasRole("ADMIN") &&
            !team.getCaptain().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("Only the team captain can register the team");
        }

        if (registrationRepository.existsByTournamentIdAndTeamId(tournamentId, team.getId())) {
            throw new DuplicateResourceException("Team is already registered for this tournament");
        }

        // Check if members count meets min requirements (if any rules apply, we can add here)

        Registration registration = Registration.builder()
                .tournament(tournament)
                .team(team)
                .status(RegistrationStatus.PENDING)
                .build();

        return mapToResponse(registrationRepository.save(registration));
    }

    @Override
    @Transactional
    public void unregisterTeam(UUID tournamentId, UUID teamId) {
        Registration registration = registrationRepository.findByTournamentIdAndTeamId(tournamentId, teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for this team"));

        if (!SecurityUtils.hasRole("ADMIN") &&
            !registration.getTeam().getCaptain().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("Only the team captain can unregister the team");
        }

        if (registration.getTournament().getStatus() != TournamentStatus.REGISTRATION_OPEN) {
            throw new InvalidStateException("Cannot unregister when registration is closed");
        }

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new InvalidStateException("Cannot unregister an " + registration.getStatus() + " registration");
        }

        registrationRepository.delete(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrations(UUID tournamentId, RegistrationStatus status) {
        Tournament tournament = getTournamentEntity(tournamentId);
        checkTournamentOwnership(tournament);

        List<Registration> registrations = (status == null) ?
                registrationRepository.findByTournamentId(tournamentId) :
                registrationRepository.findByTournamentIdAndStatus(tournamentId, status);

        return registrations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RegistrationResponse approveRegistration(UUID registrationId) {
        Registration registration = getRegistrationEntity(registrationId);
        checkTournamentOwnership(registration.getTournament());

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new InvalidStateException("Registration is already " + registration.getStatus());
        }

        long currentApproved = registrationRepository.countByTournamentIdAndStatus(
                registration.getTournament().getId(), RegistrationStatus.APPROVED);

        if (currentApproved >= registration.getTournament().getMaxParticipants()) {
            throw new BadRequestException("Tournament has reached its maximum participants limit");
        }

        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setReviewedBy(getCurrentUser());
        registration.setReviewedAt(LocalDateTime.now());
        registration.setNote(null);

        Registration savedRegistration = registrationRepository.save(registration);

        // Send email
        emailService.sendRegistrationApprovedEmail(
                savedRegistration.getTeam().getCaptain().getEmail(),
                savedRegistration.getTeam().getName(),
                savedRegistration.getTournament().getTitle()
        );

        return mapToResponse(savedRegistration);
    }

    @Override
    @Transactional
    public RegistrationResponse rejectRegistration(UUID registrationId, RegistrationRejectRequest request) {
        Registration registration = getRegistrationEntity(registrationId);
        checkTournamentOwnership(registration.getTournament());

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new InvalidStateException("Registration is already " + registration.getStatus());
        }

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setReviewedBy(getCurrentUser());
        registration.setReviewedAt(LocalDateTime.now());
        registration.setNote(request.getNote());

        Registration savedRegistration = registrationRepository.save(registration);

        // Send email
        emailService.sendRegistrationRejectedEmail(
                savedRegistration.getTeam().getCaptain().getEmail(),
                savedRegistration.getTeam().getName(),
                savedRegistration.getTournament().getTitle(),
                savedRegistration.getNote()
        );

        return mapToResponse(savedRegistration);
    }

    @Override
    @Transactional
    public List<TeamResponse> seedTeams(UUID tournamentId, List<SeedRequest> seedRequests) {
        Tournament tournament = getTournamentEntity(tournamentId);
        checkTournamentOwnership(tournament);

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_CLOSED) {
            throw new InvalidStateException("Seeding can only be done when registration is closed");
        }

        // Get all approved teams for this tournament
        List<Registration> approvedRegistrations = registrationRepository.findByTournamentIdAndStatus(
                tournamentId, RegistrationStatus.APPROVED);

        Map<UUID, Team> approvedTeamsMap = approvedRegistrations.stream()
                .map(Registration::getTeam)
                .collect(Collectors.toMap(Team::getId, Function.identity()));

        if (seedRequests.size() != approvedTeamsMap.size()) {
            throw new BadRequestException("Must provide seeds for exactly all approved teams (" + approvedTeamsMap.size() + ")");
        }

        // Validate uniqueness of seeds
        long uniqueSeeds = seedRequests.stream().map(SeedRequest::getSeedNumber).distinct().count();
        if (uniqueSeeds != seedRequests.size()) {
            throw new BadRequestException("Seed numbers must be unique");
        }

        for (SeedRequest request : seedRequests) {
            Team team = approvedTeamsMap.get(request.getTeamId());
            if (team == null) {
                throw new BadRequestException("Team with ID " + request.getTeamId() + " is not an approved team in this tournament");
            }
            team.setSeedNumber(request.getSeedNumber());
            teamRepository.save(team);
        }

        return teamService.getTeamsByTournamentId(tournamentId);
    }

    // ── Internal Helpers ─────────────────────────────────────

    private Tournament getTournamentEntity(UUID id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", "id", id));
    }

    private Registration getRegistrationEntity(UUID id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "id", id));
    }

    private User getCurrentUser() {
        return userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new UnauthorizedAccessException("Current user not found"));
    }

    private void checkTournamentOwnership(Tournament tournament) {
        if (!SecurityUtils.hasRole("ADMIN") &&
            !tournament.getCreatedBy().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("You do not have permission to manage this tournament");
        }
    }

    private RegistrationResponse mapToResponse(Registration registration) {
        return RegistrationResponse.builder()
                .id(registration.getId())
                .tournamentId(registration.getTournament().getId())
                .tournamentTitle(registration.getTournament().getTitle())
                .teamId(registration.getTeam().getId())
                .teamName(registration.getTeam().getName())
                .status(registration.getStatus())
                .note(registration.getNote())
                .reviewedById(registration.getReviewedBy() != null ? registration.getReviewedBy().getId() : null)
                .reviewedByUsername(registration.getReviewedBy() != null ? registration.getReviewedBy().getUsername() : null)
                .registeredAt(registration.getRegisteredAt())
                .reviewedAt(registration.getReviewedAt())
                .build();
    }
}
