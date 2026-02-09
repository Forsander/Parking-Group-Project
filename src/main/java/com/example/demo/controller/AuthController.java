package com.example.demo.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.requests.auth.LoginRequest;
import com.example.demo.response.ApiResponse;
import com.example.demo.response.JwtResponse;
import com.example.demo.response.MeResponse;
import com.example.demo.security.jwt.JwtUtils;
import com.example.demo.security.user.AppUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    //Spring security authenticates user -> wraps user in AppUserDetails
    //A JWT is generated and also stored in a cookie
    //Then the controllers can access the authenticated princiapal
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            ResponseCookie cookie = ResponseCookie.from("jwt", jwt)
                    .httpOnly(true) // cannot be accessed via JS
                    .secure(true)   // only over HTTPS
                    .path("/")      // valid for whole domain
                    .maxAge(3600)   // 1 hour
                    .build();


            AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
            JwtResponse jwtResponse = new JwtResponse(userDetails.getId(), jwt);


            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new ApiResponse("Login successful", jwtResponse));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        ResponseCookie deleteCookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // delete cookie immediately
                .build();

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(new ApiResponse("Logout successful", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AppUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Not authenticated", null));
        }

        var roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        MeResponse me = new MeResponse(userDetails.getId(), userDetails.getUsername(), roles);

        return ResponseEntity.ok(new ApiResponse("OK", me));
    }
}
