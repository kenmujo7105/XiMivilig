package com.example.kenmujo.ximivilig.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatchResultRequest {

    @NotNull(message = "Score 1 is required")
    @Min(value = 0, message = "Score must be non-negative")
    private Integer score1;

    @NotNull(message = "Score 2 is required")
    @Min(value = 0, message = "Score must be non-negative")
    private Integer score2;
}
