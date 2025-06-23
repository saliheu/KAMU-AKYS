package gov.hr.leavemanagement.service;

import gov.hr.leavemanagement.dto.AuthenticationRequest;
import gov.hr.leavemanagement.dto.AuthenticationResponse;
import gov.hr.leavemanagement.dto.RegisterRequest;
import gov.hr.leavemanagement.dto.UserDTO;
import gov.hr.leavemanagement.entity.User;
import gov.hr.leavemanagement.exception.ResourceAlreadyExistsException;
import gov.hr.leavemanagement.exception.UnauthorizedException;
import gov.hr.leavemanagement.repository.DepartmentRepository;
import gov.hr.leavemanagement.repository.UserRepository;
import gov.hr.leavemanagement.util.UserMapper;
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
    private final UserMapper userMapper;
    
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered");
        }
        
        if (userRepository.existsByTcNo(request.getTcNo())) {
            throw new ResourceAlreadyExistsException("TC No already registered");
        }
        
        if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new ResourceAlreadyExistsException("Employee ID already exists");
        }
        
        var user = User.builder()
            .tcNo(request.getTcNo())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .employeeId(request.getEmployeeId())
            .role(User.Role.EMPLOYEE)
            .startDate(request.getStartDate())
            .phone(request.getPhone())
            .position(request.getPosition())
            .build();
        
        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                .ifPresent(user::setDepartment);
        }
        
        if (request.getManagerId() != null) {
            userRepository.findById(request.getManagerId())
                .ifPresent(user::setManager);
        }
        
        var savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(savedUser);
        
        return AuthenticationResponse.builder()
            .accessToken(jwtToken)
            .tokenType("Bearer")
            .user(userMapper.toDTO(savedUser))
            .build();
    }
    
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        var user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder()
            .accessToken(jwtToken)
            .tokenType("Bearer")
            .user(userMapper.toDTO(user))
            .build();
    }
}