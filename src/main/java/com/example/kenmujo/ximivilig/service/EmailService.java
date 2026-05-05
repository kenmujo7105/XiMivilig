package com.example.kenmujo.ximivilig.service;

public interface EmailService {

    void sendRegistrationApprovedEmail(String toEmail, String teamName, String tournamentTitle);

    void sendRegistrationRejectedEmail(String toEmail, String teamName, String tournamentTitle, String note);
}
