package com.example.kenmujo.ximivilig.repository;

import com.example.kenmujo.ximivilig.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {

    List<Team> findByTournamentId(UUID tournamentId);

    List<Team> findByTournamentIdOrderBySeedNumberAsc(UUID tournamentId);

    List<Team> findByCaptainId(UUID captainId);

    Optional<Team> findByNameAndTournamentId(String name, UUID tournamentId);

    boolean existsByNameAndTournamentId(String name, UUID tournamentId);
}
