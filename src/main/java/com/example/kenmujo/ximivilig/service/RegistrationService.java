package com.example.kenmujo.ximivilig.service;

import com.example.kenmujo.ximivilig.dto.request.RegistrationRejectRequest;
import com.example.kenmujo.ximivilig.dto.request.RegistrationRequest;
import com.example.kenmujo.ximivilig.dto.request.SeedRequest;
import com.example.kenmujo.ximivilig.dto.response.RegistrationResponse;
import com.example.kenmujo.ximivilig.dto.response.TeamResponse;
import com.example.kenmujo.ximivilig.enums.RegistrationStatus;

import java.util.List;
import java.util.UUID;

public interface RegistrationService {

    RegistrationResponse registerTeam(UUID tournamentId, RegistrationRequest request);

    void unregisterTeam(UUID tournamentId, UUID teamId);

    List<RegistrationResponse> getRegistrations(UUID tournamentId, RegistrationStatus status);

    RegistrationResponse approveRegistration(UUID registrationId);

    RegistrationResponse rejectRegistration(UUID registrationId, RegistrationRejectRequest request);

    List<TeamResponse> seedTeams(UUID tournamentId, List<SeedRequest> seedRequests);
}
