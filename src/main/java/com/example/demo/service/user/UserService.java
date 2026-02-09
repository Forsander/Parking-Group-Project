package com.example.demo.service.user;

import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.exeptions.AlreadyExistsException;
import com.example.demo.exeptions.ResourceNotFoundException;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.requests.user.CreateUserRequest;
import com.example.demo.responseDtos.UserResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public UserResponseDto getUserById(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return convertUserToDto(user);
    }

@Override
public UserResponseDto createUser(CreateUserRequest request) {
    User usr = Optional.of(request)
            .filter(req -> !userRepository.existsByEmail(req.getEmail()))
            .map(req -> {
                User user = new User();
                user.setEmail(req.getEmail());
                user.setPassword(passwordEncoder.encode(req.getPassword()));

                Role roleUser = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_USER not found"));

                user.getRoles().add(roleUser);
                return userRepository.save(user);
            })
            .orElseThrow(() -> new AlreadyExistsException(request.getEmail() + " already exists"));

    return convertUserToDto(usr);
}

    @Override
    public void deleteUserById(Long userId) {
        userRepository.findById(userId).ifPresentOrElse(userRepository::delete,
                () -> {
                    throw new ResourceNotFoundException("User not found");
                });
    }

    //Helper method to convert user data into save dto data
    //to send to the frontend.
    private UserResponseDto convertUserToDto(User user) {
        return modelMapper.map(user, UserResponseDto.class);
    }
}
