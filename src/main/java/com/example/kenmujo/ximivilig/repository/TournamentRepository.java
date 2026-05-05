package com.example.kenmujo.ximivilig.repository;

import com.example.kenmujo.ximivilig.entity.Tournament;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, UUID> {

    Page<Tournament> findByIsPublicTrue(Pageable pageable);

    Page<Tournament> findByStatus(TournamentStatus status, Pageable pageable);

    Page<Tournament> findByFormat(TournamentFormat format, Pageable pageable);

    Page<Tournament> findByCreatedById(UUID userId, Pageable pageable);

    @Query("SELECT t FROM Tournament t WHERE t.isPublic = true "
            + "AND (:status IS NULL OR t.status = :status) "
            + "AND (:format IS NULL OR t.format = :format) "
            + "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "     OR LOWER(t.game) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Tournament> searchPublicTournaments(
            @Param("status") TournamentStatus status,
            @Param("format") TournamentFormat format,
            @Param("search") String search,
            Pageable pageable);
}
