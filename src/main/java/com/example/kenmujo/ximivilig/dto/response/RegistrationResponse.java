package com.example.kenmujo.ximivilig.dto.response;

import com.example.kenmujo.ximivilig.enums.RegistrationStatus;
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
public class RegistrationResponse {

    private UUID id;
    private UUID tournamentId;
    private String tournamentTitle;
    private UUID teamId;
    private String teamName;
    private RegistrationStatus status;
    private String note;
    private UUID reviewedById;
    private String reviewedByUsername;
    private LocalDateTime registeredAt;
    private LocalDateTime reviewedAt;
}
