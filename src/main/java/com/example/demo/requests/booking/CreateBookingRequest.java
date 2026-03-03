package com.example.demo.requests.booking;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {

    @NotNull(message = "spotId is required")
    @JsonAlias({ "spotId", "spot_id" })
    private Long spotId;

    @NotNull(message = "startTime is required")
    @JsonAlias({ "startTime", "start_time" })
    private LocalDateTime startTime;

    @NotNull(message = "endTime is required")
    @JsonAlias({ "endTime", "end_time" })
    private LocalDateTime endTime;
}
