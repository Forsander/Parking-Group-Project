package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exeptions.ActionNotAllowedException;
import com.example.demo.exeptions.ResourceNotFoundException;
import com.example.demo.requests.booking.CreateBookingRequest;
import com.example.demo.response.ApiResponse;
import com.example.demo.responseDtos.BookingResponseDto;
import com.example.demo.security.user.AppUserDetails;
import com.example.demo.service.booking.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/bookings")
public class BookingController {

    private final BookingService IBookingService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        try {
            BookingResponseDto bookingResponseDto = IBookingService.createBooking(userDetails, request);
            return ResponseEntity.ok(new ApiResponse("Booking Created", bookingResponseDto));
        } catch (ResourceNotFoundException | ActionNotAllowedException e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse("Something went wrong when creating a booking", e.getMessage()));
        }
    }

    @PutMapping("/booking/{bookingId}/cancel")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        try {
            BookingResponseDto bookingResponseDto = IBookingService.cancelBooking(userDetails, bookingId);
            return ResponseEntity.ok(new ApiResponse("Booking cancelled", bookingResponseDto));
        } catch (ResourceNotFoundException | ActionNotAllowedException e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse("Something went wrong when cancelling booking: " + bookingId, e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/update")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> updateBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        try {
            BookingResponseDto bookingResponseDto = IBookingService.updateBooking(userDetails, bookingId, request);
            return ResponseEntity.ok(new ApiResponse("Booking updated successfully", bookingResponseDto));
        } catch (ResourceNotFoundException | ActionNotAllowedException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("Error updating booking", e.getMessage()));
        }
    }

    @GetMapping("/renter/{renterId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> getBookingsByRenter(@PathVariable Long renterId) {
        try {
            List<BookingResponseDto> bookings = IBookingService.getBookingsByRenter(renterId);
            return ResponseEntity.ok(new ApiResponse("Bookings fetched successfully", bookings));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("Error fetching bookings by renter", e.getMessage()));
        }
    }

    @GetMapping("/spot/{spotId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponse> getBookingsBySpot(@PathVariable Long spotId) {
        try {
            List<BookingResponseDto> bookings = IBookingService.getBookingsBySpot(spotId);
            return ResponseEntity.ok(new ApiResponse("Bookings fetched successfully", bookings));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(new ApiResponse("Error fetching bookings by spot", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getAllBookings() {
        List<BookingResponseDto> bookings = IBookingService.getAllBookings();
        return ResponseEntity.ok(new ApiResponse("All bookings fetched successfully", bookings));
    }
}