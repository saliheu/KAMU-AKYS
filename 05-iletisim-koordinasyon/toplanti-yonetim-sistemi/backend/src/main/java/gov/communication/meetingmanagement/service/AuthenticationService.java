package gov.communication.meetingmanagement.service;

import gov.communication.meetingmanagement.dto.AuthenticationRequest;
import gov.communication.meetingmanagement.dto.AuthenticationResponse;
import gov.communication.meetingmanagement.dto.RegisterRequest;
import gov.communication.meetingmanagement.dto.UserDTO;
import gov.communication.meetingmanagement.entity.Department;
import gov.communication.meetingmanagement.entity.User;
import gov.communication.meetingmanagement.repository.DepartmentRepository;
import gov.communication.meetingmanagement.repository.UserRepository;
import gov.communication.meetingmanagement.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Kullanıcı adı zaten kullanılıyor");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-posta adresi zaten kullanılıyor");
        }
        
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Departman bulunamadı"));
        }
        
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .title(request.getTitle())
                .department(department)
                .role(User.Role.USER)
                .enabled(true)
                .build();
        
        userRepository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(UserDTO.fromEntity(user))
                .build();
    }
    
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
        
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(UserDTO.fromEntity(user))
                .build();
    }
}