package com.example.kenmujo.ximivilig.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RegistrationRequest {

    @NotNull(message = "Team ID is required")
    private UUID teamId;
}
