package com.example.kenmujo.ximivilig.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SeedRequest {

    @NotNull(message = "Team ID is required")
    private UUID teamId;

    @NotNull(message = "Seed number is required")
    @Min(value = 1, message = "Seed number must be at least 1")
    private Integer seedNumber;
}
