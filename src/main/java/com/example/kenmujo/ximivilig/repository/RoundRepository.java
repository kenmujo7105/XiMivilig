package com.example.kenmujo.ximivilig.repository;

import com.example.kenmujo.ximivilig.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoundRepository extends JpaRepository<Round, UUID> {

    List<Round> findByTournamentIdOrderByRoundNumberAsc(UUID tournamentId);

    List<Round> findByTournamentIdAndIsLoserBracketOrderByRoundNumberAsc(
            UUID tournamentId, Boolean isLoserBracket);
}
