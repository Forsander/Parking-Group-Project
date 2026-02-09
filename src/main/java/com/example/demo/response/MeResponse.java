package com.example.demo.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String email;
    private List<String> roles;
}
