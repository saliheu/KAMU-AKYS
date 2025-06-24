# Dilekçe Şikayet Yönetim Sistemi (Petition and Complaint Management System)

A comprehensive Spring Boot backend system for managing citizen petitions and complaints with workflow management, priority levels, department routing, and response tracking.

## Features

- **Citizen Management**: Registration and management of citizens who can submit complaints
- **Complaint Submission**: Citizens can submit various types of complaints/petitions
- **Workflow Management**: Complete workflow from submission to resolution
- **Priority Levels**: Urgent, High, Medium, and Low priority assignments
- **Department Routing**: Automatic or manual routing to appropriate departments
- **Officer Assignment**: Complaints can be assigned to specific officers
- **Response Tracking**: Track all responses and communications
- **File Attachments**: Support for document attachments
- **Audit Trail**: Complete history tracking of all actions
- **Satisfaction Rating**: Citizens can rate the resolution of their complaints
- **JWT Authentication**: Secure authentication using JWT tokens
- **Role-Based Access Control**: Different access levels for citizens, officers, and admins

## Technology Stack

- **Java 17**
- **Spring Boot 3.1.0**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **Lombok** for reducing boilerplate code
- **SpringDoc OpenAPI** for API documentation
- **Maven** for dependency management

## Project Structure

```
src/main/java/gov/citizen/complaintmanagement/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── exception/      # Custom exceptions
├── repository/     # JPA repositories
├── security/       # Security configurations and JWT
└── service/        # Business logic services
```

## Key Entities

- **Complaint**: Main entity representing citizen complaints/petitions
- **Citizen**: Citizens who can submit complaints
- **User**: System users (officers, administrators)
- **Department**: Government departments handling complaints
- **ComplaintResponse**: Responses to complaints
- **ComplaintHistory**: Audit trail of all actions
- **ComplaintAttachment**: File attachments

## Running the Application

1. **Prerequisites**:
   - Java 17 or higher
   - PostgreSQL database
   - Maven 3.6+

2. **Database Setup**:
   - Create a PostgreSQL database named `complaint_management_db`
   - Update database credentials in `application.properties`

3. **Build and Run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access the Application**:
   - API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/swagger-ui.html

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/citizens/register` - Citizen registration
- `GET /api/complaints/track/{complaintNumber}` - Track complaint by number

### Protected Endpoints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/{id}` - Get complaint details
- `PUT /api/complaints/{id}` - Update complaint
- `POST /api/complaints/{id}/responses` - Add response to complaint

## Security

The system uses JWT for authentication. After successful login, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Complaint Workflow

1. **Submitted**: Initial state when citizen submits complaint
2. **Under Review**: Complaint is being reviewed
3. **Assigned**: Assigned to a department/officer
4. **In Progress**: Being actively worked on
5. **Waiting Citizen Response**: Awaiting additional information
6. **Resolved**: Solution provided
7. **Closed**: Complaint closed
8. **Rejected**: Complaint rejected with reason

## Development

To contribute to this project:

1. Follow Spring Boot best practices
2. Write unit tests for new features
3. Update API documentation
4. Follow the existing code style

## License

This project is part of the government citizen services initiative.