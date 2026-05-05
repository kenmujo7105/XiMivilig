package com.example.kenmujo.ximivilig.service;

import com.example.kenmujo.ximivilig.dto.request.LoginRequest;
import com.example.kenmujo.ximivilig.dto.request.RegisterRequest;
import com.example.kenmujo.ximivilig.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
