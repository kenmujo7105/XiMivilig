package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.dto.request.MatchResultRequest;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse.MatchResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse.RoundResponse;
import com.example.kenmujo.ximivilig.dto.response.BracketResponse.TeamInfo;
import com.example.kenmujo.ximivilig.dto.response.StandingResponse;
import com.example.kenmujo.ximivilig.entity.Match;
import com.example.kenmujo.ximivilig.entity.Round;
import com.example.kenmujo.ximivilig.entity.Team;
import com.example.kenmujo.ximivilig.entity.Tournament;
import com.example.kenmujo.ximivilig.enums.MatchStatus;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import com.example.kenmujo.ximivilig.exception.BadRequestException;
import com.example.kenmujo.ximivilig.exception.InvalidStateException;
import com.example.kenmujo.ximivilig.exception.ResourceNotFoundException;
import com.example.kenmujo.ximivilig.exception.UnauthorizedAccessException;
import com.example.kenmujo.ximivilig.repository.MatchRepository;
import com.example.kenmujo.ximivilig.repository.RoundRepository;
import com.example.kenmujo.ximivilig.repository.TeamRepository;
import com.example.kenmujo.ximivilig.repository.TournamentRepository;
import com.example.kenmujo.ximivilig.service.BracketService;
import com.example.kenmujo.ximivilig.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BracketServiceImpl implements BracketService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final MatchRepository matchRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void generateBracket(UUID tournamentId) {
        Tournament tournament = getTournamentEntity(tournamentId);
        checkTournamentOwnership(tournament);

        if (tournament.getStatus() != TournamentStatus.REGISTRATION_CLOSED) {
            throw new InvalidStateException("Registration must be closed before generating bracket");
        }

        List<Team> teams = teamRepository.findByTournamentIdOrderBySeedNumberAsc(tournamentId);
        if (teams.size() < tournament.getMinParticipants()) {
            throw new BadRequestException("Not enough teams to start tournament. Minimum: " + tournament.getMinParticipants());
        }

        if (tournament.getFormat() == TournamentFormat.SINGLE_ELIMINATION) {
            generateSingleElimination(tournament, teams);
        } else if (tournament.getFormat() == TournamentFormat.ROUND_ROBIN) {
            generateRoundRobin(tournament, teams);
        } else {
            throw new UnsupportedOperationException(tournament.getFormat() + " is not fully implemented yet");
        }

        tournament.setStatus(TournamentStatus.IN_PROGRESS);
        tournamentRepository.save(tournament);
    }

    private void generateSingleElimination(Tournament tournament, List<Team> teams) {
        int numTeams = teams.size();
        // Next power of 2
        int bracketSize = 1;
        while (bracketSize < numTeams) {
            bracketSize *= 2;
        }
        
        int numByes = bracketSize - numTeams;
        int numRounds = (int) (Math.log(bracketSize) / Math.log(2));

        // Create all rounds
        List<Round> rounds = new ArrayList<>();
        for (int i = 1; i <= numRounds; i++) {
            Round round = Round.builder()
                    .tournament(tournament)
                    .roundNumber(i)
                    .name("Round " + i)
                    .build();
            if (i == numRounds) round.setName("Final");
            if (i == numRounds - 1 && numRounds > 1) round.setName("Semi-Finals");
            rounds.add(roundRepository.save(round));
        }

        // Create matches from last round to first round
        List<Match> previousRoundMatches = new ArrayList<>();
        
        for (int r = numRounds; r >= 1; r--) {
            Round currentRound = rounds.get(r - 1);
            int matchesInRound = bracketSize / (int) Math.pow(2, r);
            List<Match> currentRoundMatches = new ArrayList<>();

            for (int m = 0; m < matchesInRound; m++) {
                Match match = Match.builder()
                        .round(currentRound)
                        .matchOrder(m)
                        .status(MatchStatus.SCHEDULED)
                        .build();

                // Link to next match if not final
                if (r < numRounds) {
                    Match nextMatch = previousRoundMatches.get(m / 2);
                    match.setNextMatchId(nextMatch.getId());
                }

                currentRoundMatches.add(matchRepository.save(match));
            }
            
            // To link in next iteration
            if (r < numRounds) {
                // We need to update currentRoundMatches with the IDs so we save them again,
                // but actually JPA already assigned IDs. However, the nextMatchId was set
                // before saving the next matches. Wait, previousRoundMatches are already saved!
                // Yes, because we iterate from numRounds down to 1.
                // So previousRoundMatches HAVE ids.
            }
            
            // Update previousRoundMatches for the next iteration (r-1)
            previousRoundMatches = new ArrayList<>(currentRoundMatches);
        }

        // Now populate Round 1 with teams and BYEs
        List<Match> firstRoundMatches = previousRoundMatches;
        
        // Standard seeding array (e.g. 1-8, 4-5, 2-7, 3-6)
        int[] seedMap = generateSeedMap(bracketSize);
        
        for (int i = 0; i < bracketSize / 2; i++) {
            Match match = firstRoundMatches.get(i);
            
            int seed1 = seedMap[i * 2];
            int seed2 = seedMap[i * 2 + 1];
            
            Team t1 = seed1 <= numTeams ? teams.get(seed1 - 1) : null;
            Team t2 = seed2 <= numTeams ? teams.get(seed2 - 1) : null;
            
            match.setTeam1(t1);
            match.setTeam2(t2);
            
            // Handle BYEs
            if (t1 == null || t2 == null) {
                match.setStatus(MatchStatus.BYE);
                match.setWinner(t1 != null ? t1 : t2);
                match.setCompletedAt(LocalDateTime.now());
                
                // Auto-advance BYE winner to next round
                if (match.getNextMatchId() != null) {
                    Match nextMatch = matchRepository.findById(match.getNextMatchId()).orElseThrow();
                    if (nextMatch.getTeam1() == null) {
                        nextMatch.setTeam1(match.getWinner());
                    } else {
                        nextMatch.setTeam2(match.getWinner());
                    }
                    matchRepository.save(nextMatch);
                }
            }
            
            matchRepository.save(match);
        }
    }
    
    /**
     * Generates standard elimination seed pairings.
     */
    private int[] generateSeedMap(int size) {
        int[] seeds = new int[size];
        seeds[0] = 1;
        seeds[1] = 2;
        for (int s = 2; s < size; s *= 2) {
            int[] temp = new int[s * 2];
            for (int i = 0; i < s; i++) {
                temp[i * 2] = seeds[i];
                temp[i * 2 + 1] = s * 2 + 1 - seeds[i];
            }
            for (int i = 0; i < s * 2; i++) {
                seeds[i] = temp[i];
            }
        }
        return seeds;
    }

    private void generateRoundRobin(Tournament tournament, List<Team> teams) {
        int numTeams = teams.size();
        boolean oddTeams = numTeams % 2 != 0;
        if (oddTeams) {
            teams.add(null); // Add a BYE team
            numTeams++;
        }

        int numRounds = numTeams - 1;
        int matchesPerRound = numTeams / 2;

        for (int r = 0; r < numRounds; r++) {
            Round round = Round.builder()
                    .tournament(tournament)
                    .roundNumber(r + 1)
                    .name("Round " + (r + 1))
                    .build();
            round = roundRepository.save(round);

            for (int m = 0; m < matchesPerRound; m++) {
                Team t1 = teams.get(m);
                Team t2 = teams.get(numTeams - 1 - m);

                Match match = Match.builder()
                        .round(round)
                        .matchOrder(m)
                        .team1(t1)
                        .team2(t2)
                        .status(t1 == null || t2 == null ? MatchStatus.BYE : MatchStatus.SCHEDULED)
                        .build();

                if (match.getStatus() == MatchStatus.BYE) {
                    match.setWinner(t1 != null ? t1 : t2);
                    match.setCompletedAt(LocalDateTime.now());
                }

                matchRepository.save(match);
            }

            // Rotate teams (keep first team fixed)
            teams.add(1, teams.remove(numTeams - 1));
        }
    }

    @Override
    @Transactional
    public MatchResponse updateMatchResult(UUID matchId, MatchResultRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", "id", matchId));
        
        Tournament tournament = match.getRound().getTournament();
        checkTournamentOwnership(tournament);

        if (match.getStatus() == MatchStatus.BYE) {
            throw new InvalidStateException("Cannot update result of a BYE match");
        }

        if (match.getTeam1() == null || match.getTeam2() == null) {
            throw new InvalidStateException("Match is not ready (teams are missing)");
        }

        match.setScore1(request.getScore1());
        match.setScore2(request.getScore2());
        match.setStatus(MatchStatus.COMPLETED);
        match.setCompletedAt(LocalDateTime.now());

        if (request.getScore1() > request.getScore2()) {
            match.setWinner(match.getTeam1());
        } else if (request.getScore2() > request.getScore1()) {
            match.setWinner(match.getTeam2());
        } else {
            // Draw
            if (tournament.getFormat() != TournamentFormat.ROUND_ROBIN) {
                throw new BadRequestException("Draws are not allowed in elimination formats");
            }
            match.setWinner(null);
        }

        Match savedMatch = matchRepository.save(match);

        // Auto advance
        if (savedMatch.getNextMatchId() != null && savedMatch.getWinner() != null) {
            Match nextMatch = matchRepository.findById(savedMatch.getNextMatchId()).orElseThrow();
            if (nextMatch.getTeam1() == null) {
                nextMatch.setTeam1(savedMatch.getWinner());
            } else if (nextMatch.getTeam2() == null && !nextMatch.getTeam1().getId().equals(savedMatch.getWinner().getId())) {
                nextMatch.setTeam2(savedMatch.getWinner());
            }
            matchRepository.save(nextMatch);
        }

        checkTournamentCompletion(tournament);

        MatchResponse response = mapToMatchResponse(savedMatch);

        // Push live update via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/tournaments/" + tournament.getId() + "/matches", 
                response
        );

        return response;
    }

    private void checkTournamentCompletion(Tournament tournament) {
        long incompleteMatches = matchRepository.countByTournamentIdAndStatus(tournament.getId(), MatchStatus.SCHEDULED) +
                                 matchRepository.countByTournamentIdAndStatus(tournament.getId(), MatchStatus.IN_PROGRESS);
        if (incompleteMatches == 0) {
            tournament.setStatus(TournamentStatus.COMPLETED);
            tournamentRepository.save(tournament);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BracketResponse getTournamentBracket(UUID tournamentId) {
        Tournament tournament = getTournamentEntity(tournamentId);
        List<Round> rounds = roundRepository.findByTournamentIdOrderByRoundNumberAsc(tournamentId);

        List<RoundResponse> roundResponses = rounds.stream().map(round -> {
            List<Match> matches = matchRepository.findByRoundIdOrderByMatchOrderAsc(round.getId());
            List<MatchResponse> matchResponses = matches.stream().map(this::mapToMatchResponse).collect(Collectors.toList());
            
            return RoundResponse.builder()
                    .id(round.getId())
                    .roundNumber(round.getRoundNumber())
                    .name(round.getName())
                    .isLoserBracket(round.getIsLoserBracket())
                    .matches(matchResponses)
                    .build();
        }).collect(Collectors.toList());

        return BracketResponse.builder()
                .tournamentId(tournamentId)
                .format(tournament.getFormat())
                .rounds(roundResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getTournamentMatches(UUID tournamentId) {
        return matchRepository.findByTournamentIdOrdered(tournamentId)
                .stream().map(this::mapToMatchResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StandingResponse> getStandings(UUID tournamentId) {
        Tournament tournament = getTournamentEntity(tournamentId);
        if (tournament.getFormat() != TournamentFormat.ROUND_ROBIN) {
            throw new BadRequestException("Standings are only available for Round Robin tournaments");
        }

        List<Team> teams = teamRepository.findByTournamentId(tournamentId);
        List<Match> matches = matchRepository.findByTournamentIdOrdered(tournamentId);

        Map<UUID, StandingResponse> standingsMap = new HashMap<>();
        for (Team team : teams) {
            standingsMap.put(team.getId(), StandingResponse.builder()
                    .team(mapToStandingTeamInfo(team))
                    .build());
        }

        for (Match m : matches) {
            if (m.getStatus() == MatchStatus.COMPLETED && m.getTeam1() != null && m.getTeam2() != null) {
                StandingResponse s1 = standingsMap.get(m.getTeam1().getId());
                StandingResponse s2 = standingsMap.get(m.getTeam2().getId());

                s1.setPlayed(s1.getPlayed() + 1);
                s2.setPlayed(s2.getPlayed() + 1);

                s1.setGoalsFor(s1.getGoalsFor() + m.getScore1());
                s1.setGoalsAgainst(s1.getGoalsAgainst() + m.getScore2());
                s2.setGoalsFor(s2.getGoalsFor() + m.getScore2());
                s2.setGoalsAgainst(s2.getGoalsAgainst() + m.getScore1());

                if (m.getScore1() > m.getScore2()) {
                    s1.setWon(s1.getWon() + 1);
                    s1.setPoints(s1.getPoints() + 3);
                    s2.setLost(s2.getLost() + 1);
                } else if (m.getScore2() > m.getScore1()) {
                    s2.setWon(s2.getWon() + 1);
                    s2.setPoints(s2.getPoints() + 3);
                    s1.setLost(s1.getLost() + 1);
                } else {
                    s1.setDrawn(s1.getDrawn() + 1);
                    s1.setPoints(s1.getPoints() + 1);
                    s2.setDrawn(s2.getDrawn() + 1);
                    s2.setPoints(s2.getPoints() + 1);
                }
            }
        }

        List<StandingResponse> standings = new ArrayList<>(standingsMap.values());
        for (StandingResponse s : standings) {
            s.setGoalDifference(s.getGoalsFor() - s.getGoalsAgainst());
        }

        standings.sort(Comparator.comparing(StandingResponse::getPoints).reversed()
                .thenComparing(Comparator.comparing(StandingResponse::getGoalDifference).reversed())
                .thenComparing(Comparator.comparing(StandingResponse::getGoalsFor).reversed()));

        for (int i = 0; i < standings.size(); i++) {
            standings.get(i).setRank(i + 1);
        }

        return standings;
    }

    // ── Internal Helpers ─────────────────────────────────────

    private Tournament getTournamentEntity(UUID id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament", "id", id));
    }

    private void checkTournamentOwnership(Tournament tournament) {
        if (!SecurityUtils.hasRole("ADMIN") &&
            !tournament.getCreatedBy().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new UnauthorizedAccessException("You do not have permission to manage this tournament bracket");
        }
    }

    private MatchResponse mapToMatchResponse(Match match) {
        return MatchResponse.builder()
                .id(match.getId())
                .matchOrder(match.getMatchOrder())
                .team1(mapToTeamInfo(match.getTeam1()))
                .team2(mapToTeamInfo(match.getTeam2()))
                .score1(match.getScore1())
                .score2(match.getScore2())
                .winner(mapToTeamInfo(match.getWinner()))
                .status(match.getStatus())
                .scheduledAt(match.getScheduledAt())
                .completedAt(match.getCompletedAt())
                .nextMatchId(match.getNextMatchId())
                .build();
    }

    private TeamInfo mapToTeamInfo(Team team) {
        if (team == null) return null;
        return TeamInfo.builder()
                .id(team.getId())
                .name(team.getName())
                .seedNumber(team.getSeedNumber())
                .build();
    }

    private StandingResponse.TeamInfo mapToStandingTeamInfo(Team team) {
        if (team == null) return null;
        return StandingResponse.TeamInfo.builder()
                .id(team.getId())
                .name(team.getName())
                .build();
    }
}
