package com.example.kenmujo.ximivilig.dto.response;

import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import com.example.kenmujo.ximivilig.enums.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentResponse {

    private UUID id;
    private String title;
    private String description;
    private String game;
    private TournamentFormat format;
    private TournamentStatus status;
    private Integer maxParticipants;
    private Integer minParticipants;
    private LocalDateTime registrationStartAt;
    private LocalDateTime registrationEndAt;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean isPublic;
    private UUID createdById;
    private String createdByUsername;
    private long registeredTeamsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
