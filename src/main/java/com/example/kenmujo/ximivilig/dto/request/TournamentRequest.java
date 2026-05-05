package com.example.kenmujo.ximivilig.dto.request;

import com.example.kenmujo.ximivilig.enums.TournamentFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TournamentRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    private String description;

    @Size(max = 100, message = "Game must be at most 100 characters")
    private String game;

    @NotNull(message = "Format is required")
    private TournamentFormat format;

    @NotNull(message = "Max participants is required")
    @Min(value = 2, message = "Max participants must be at least 2")
    private Integer maxParticipants;

    @Min(value = 2, message = "Min participants must be at least 2")
    private Integer minParticipants = 2;

    @FutureOrPresent(message = "Registration start time cannot be in the past")
    private LocalDateTime registrationStartAt;

    @Future(message = "Registration end time must be in the future")
    private LocalDateTime registrationEndAt;

    @Future(message = "Start time must be in the future")
    private LocalDateTime startAt;

    @Future(message = "End time must be in the future")
    private LocalDateTime endAt;

    private Boolean isPublic = true;
}
