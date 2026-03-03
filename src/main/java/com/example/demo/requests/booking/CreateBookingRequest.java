package com.example.demo.requests.booking;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CreateBookingRequest {
    private Long spotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
