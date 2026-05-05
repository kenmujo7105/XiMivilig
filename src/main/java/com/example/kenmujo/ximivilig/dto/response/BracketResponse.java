package com.example.kenmujo.ximivilig.dto.response;

import com.example.kenmujo.ximivilig.enums.MatchStatus;
import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BracketResponse {

    private UUID tournamentId;
    private TournamentFormat format;
    private List<RoundResponse> rounds;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoundResponse {
        private UUID id;
        private Integer roundNumber;
        private String name;
        private Boolean isLoserBracket;
        private List<MatchResponse> matches;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchResponse {
        private UUID id;
        private Integer matchOrder;
        private TeamInfo team1;
        private TeamInfo team2;
        private Integer score1;
        private Integer score2;
        private TeamInfo winner;
        private MatchStatus status;
        private LocalDateTime scheduledAt;
        private LocalDateTime completedAt;
        private UUID nextMatchId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeamInfo {
        private UUID id;
        private String name;
        private Integer seedNumber;
    }
}
