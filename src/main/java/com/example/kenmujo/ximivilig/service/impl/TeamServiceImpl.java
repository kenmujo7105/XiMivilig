package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.dto.request.TeamRequest;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;
import com.example.kenmujo.ximivilig.entity.Registration;
import com.example.kenmujo.ximivilig.entity.Team;
import com.example.kenmujo.ximivilig.entity.TeamMember;
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
import com.example.kenmujo.ximivilig.repository.TeamMemberRepository;
import com.example.kenmujo.ximivilig.repository.TeamRepository;
import com.example.kenmujo.ximivilig.repository.TournamentRepository;
import com.example.kenmujo.ximivilig.repository.UserRepository;
import com.example.kenmujo.ximivilig.service.TeamService;
import com.example.kenmujo.ximivilig.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getTeamsByTournamentId(UUID tournamentId) {
        return teamRepository.findByTournamentIdOrderBySeedNumberAsc(tournamentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse getTeamById(UUID id) {
        return mapToResponse(getTeamEntity(id));
    }

    @Override
    @Transactional
    public TeamResponse createTeam(UUID tournamentId, TeamRequest request) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", "id", tournamentId));

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN &&
            tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new InvalidStateException("Cannot create team. Tournament is not accepting teams right now.");
        }

        if (teamRepository.existsByNameAndTournamentId(request.getName(), tournamentId)) {
            throw new DuplicateResourceException("Team name already exists in this tournament");
        }

        User currentUser = getCurrentUser();

        Team team = Team.builder()
                .name(request.getName())
                .logoUrl(request.getLogoUrl())
                .description(request.getDescription())
                .captain(currentUser)
                .tournament(tournament)
                .build();

        Team savedTeam = teamRepository.save(team);

        // Add captain as a member automatically
        TeamMember captainMember = TeamMember.builder()
                .team(savedTeam)
                .user(currentUser)
                .build();
        teamMemberRepository.save(captainMember);
        
        savedTeam.getMembers().add(captainMember);

        return mapToResponse(savedTeam);
    }

    @Override
    @Transactional
    public TeamResponse updateTeam(UUID id, TeamRequest request) {
        Team team = getTeamEntity(id);
        checkCaptainOrAdmin(team);

        if (!team.getName().equals(request.getName()) &&
            teamRepository.existsByNameAndTournamentId(request.getName(), team.getTournament().getId())) {
            throw new DuplicateResourceException("Team name already exists in this tournament");
        }

        team.setName(request.getName());
        team.setLogoUrl(request.getLogoUrl());
        team.setDescription(request.getDescription());

        return mapToResponse(teamRepository.save(team));
    }

    @Override
    @Transactional
    public TeamResponse addMember(UUID id, UUID userId) {
        Team team = getTeamEntity(id);
        checkCaptainOrAdmin(team);

        if (team.getTournament().getStatus() == TournamentStatus.IN_PROGRESS ||
            team.getTournament().getStatus() == TournamentStatus.COMPLETED) {
            throw new InvalidStateException("Cannot modify roster while tournament is in progress or completed");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (teamMemberRepository.existsByTeamIdAndUserId(id, userId)) {
            throw new DuplicateResourceException("User is already a member of this team");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(user)
                .build();
        
        teamMemberRepository.save(member);
        team.getMembers().add(member);

        return mapToResponse(team);
    }

    @Override
    @Transactional
    public void removeMember(UUID id, UUID userId) {
        Team team = getTeamEntity(id);
        checkCaptainOrAdmin(team);

        if (team.getTournament().getStatus() == TournamentStatus.IN_PROGRESS ||
            team.getTournament().getStatus() == TournamentStatus.COMPLETED) {
            throw new InvalidStateException("Cannot modify roster while tournament is in progress or completed");
        }

        if (team.getCaptain().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove the captain. Transfer leadership first (not implemented) or delete team.");
        }

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "userId", userId));

        teamMemberRepository.delete(member);
    }

    // ── Internal Helpers ─────────────────────────────────────

    private Team getTeamEntity(UUID id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", id));
    }

    private User getCurrentUser() {
        return userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new UnauthorizedAccessException("Current user not found"));
    }

    private void checkCaptainOrAdmin(Team team) {
        if (!SecurityUtils.hasRole("ADMIN") &&
            !team.getCaptain().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("Only the team captain can perform this action");
        }
    }

    private TeamResponse mapToResponse(Team team) {
        RegistrationStatus regStatus = null;
        if (team.getTournament() != null) {
            Optional<Registration> reg = registrationRepository.findByTournamentIdAndTeamId(
                    team.getTournament().getId(), team.getId());
            if (reg.isPresent()) {
                regStatus = reg.get().getStatus();
            }
        }

        List<TeamResponse.TeamMemberResponse> memberResponses = team.getMembers().stream()
                .map(m -> TeamResponse.TeamMemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .logoUrl(team.getLogoUrl())
                .description(team.getDescription())
                .seedNumber(team.getSeedNumber())
                .captainId(team.getCaptain().getId())
                .captainUsername(team.getCaptain().getUsername())
                .tournamentId(team.getTournament().getId())
                .registrationStatus(regStatus)
                .members(memberResponses)
                .createdAt(team.getCreatedAt())
                .build();
    }
}
