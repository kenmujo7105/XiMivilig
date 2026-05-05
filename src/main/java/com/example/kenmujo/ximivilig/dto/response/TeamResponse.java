package com.example.kenmujo.ximivilig.dto.response;

import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
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
public class TeamResponse {

    private UUID id;
    private String name;
    private String logoUrl;
    private String description;
    private Integer seedNumber;
    private UUID captainId;
    private String captainUsername;
    private UUID tournamentId;
    private RegistrationStatus registrationStatus;
    private List<TeamMemberResponse> members;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeamMemberResponse {
        private UUID id;
        private UUID userId;
        private String username;
        private LocalDateTime joinedAt;
    }
}
