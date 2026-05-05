package com.example.kenmujo.ximivilig.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationRejectRequest {

    @NotBlank(message = "Rejection note is required")
    private String note;
}
