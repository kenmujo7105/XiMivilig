package com.example.kenmujo.ximivilig.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rounds", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tournament_id", "round_number", "is_loser_bracket"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    /**
     * Human-readable name like "Quarter-Finals", "Semi-Finals", "Final".
     */
    @Column(length = 50)
    private String name;

    /**
     * True if this round belongs to the loser bracket (Double Elimination).
     */
    @Column(name = "is_loser_bracket", nullable = false)
    @Builder.Default
    private Boolean isLoserBracket = false;

    // ── Relationships ───────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<Match> matches = new ArrayList<>();
}
