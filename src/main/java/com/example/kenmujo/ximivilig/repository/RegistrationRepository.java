package com.example.kenmujo.ximivilig.repository;

import com.example.kenmujo.ximivilig.entity.Registration;
import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    List<Registration> findByTournamentId(UUID tournamentId);

    List<Registration> findByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);

    Optional<Registration> findByTournamentIdAndTeamId(UUID tournamentId, UUID teamId);

    boolean existsByTournamentIdAndTeamId(UUID tournamentId, UUID teamId);

    long countByTournamentIdAndStatus(UUID tournamentId, RegistrationStatus status);
}
