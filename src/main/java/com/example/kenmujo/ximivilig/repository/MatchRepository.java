package com.example.kenmujo.ximivilig.repository;

import com.example.kenmujo.ximivilig.entity.Match;
import com.example.kenmujo.ximivilig.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {

    List<Match> findByRoundId(UUID roundId);

    List<Match> findByRoundIdOrderByMatchOrderAsc(UUID roundId);

    @Query("SELECT m FROM Match m JOIN m.round r WHERE r.tournament.id = :tournamentId ORDER BY r.roundNumber, m.matchOrder")
    List<Match> findByTournamentIdOrdered(@Param("tournamentId") UUID tournamentId);

    @Query("SELECT m FROM Match m JOIN m.round r WHERE r.tournament.id = :tournamentId AND m.status = :status")
    List<Match> findByTournamentIdAndStatus(
            @Param("tournamentId") UUID tournamentId,
            @Param("status") MatchStatus status);

    @Query("SELECT COUNT(m) FROM Match m JOIN m.round r WHERE r.tournament.id = :tournamentId AND m.status = :status")
    long countByTournamentIdAndStatus(
            @Param("tournamentId") UUID tournamentId,
            @Param("status") MatchStatus status);

    @Query("SELECT m FROM Match m WHERE m.team1.id = :teamId OR m.team2.id = :teamId ORDER BY m.round.roundNumber")
    List<Match> findByTeamId(@Param("teamId") UUID teamId);
}
