package com.example.kenmujo.ximivilig.service.impl;

import com.example.kenmujo.ximivilig.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendRegistrationApprovedEmail(String toEmail, String teamName, String tournamentTitle) {
        String subject = "Registration Approved - " + tournamentTitle;
        String text = String.format("Hello %s Captain,\n\nYour team's registration for the tournament '%s' has been APPROVED.\n\nGet ready!", teamName, tournamentTitle);
        sendSimpleMessage(toEmail, subject, text);
    }

    @Override
    @Async
    public void sendRegistrationRejectedEmail(String toEmail, String teamName, String tournamentTitle, String note) {
        String subject = "Registration Update - " + tournamentTitle;
        String text = String.format("Hello %s Captain,\n\nUnfortunately, your team's registration for the tournament '%s' has been REJECTED.\n\nReason: %s", teamName, tournamentTitle, note);
        sendSimpleMessage(toEmail, subject, text);
    }

    private void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            // We don't throw the exception because we don't want to rollback the transaction just because an email failed
        }
    }
}
