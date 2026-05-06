package com.syncspace.server.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}