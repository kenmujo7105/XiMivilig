package com.example.kenmujo.ximivilig.entity;

import com.example.kenmujo.ximivilig.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Position of this match within the bracket.
     * Used to determine layout when rendering the bracket visually.
     */
    @Column(nullable = false)
    private Integer matchOrder;

    private Integer score1;

    private Integer score2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    private LocalDateTime scheduledAt;

    private LocalDateTime completedAt;

    /**
     * Points to the next match the winner advances to (Elimination brackets).
     * Null for the final match.
     */
    private UUID nextMatchId;

    // ── Relationships ───────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    /**
     * First team. Null if this slot is a BYE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team1_id")
    private Team team1;

    /**
     * Second team. Null if this slot is a BYE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team2_id")
    private Team team2;

    /**
     * Winner of the match. Set after scores are submitted.
     * Null for draws (Round Robin) or unplayed matches.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private Team winner;
}
