package com.example.kenmujo.ximivilig.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamRequest {

    @NotBlank(message = "Team name is required")
    @Size(max = 100, message = "Team name must be at most 100 characters")
    private String name;

    @Size(max = 500, message = "Logo URL must be at most 500 characters")
    private String logoUrl;

    private String description;
}
