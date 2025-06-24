package gov.citizen.complaintmanagement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger configuration
 * OpenAPI/Swagger yapılandırması
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Dilekçe Şikayet Yönetim Sistemi API")
                        .version("1.0.0")
                        .description("Vatandaş dilekçe ve şikayet yönetim sistemi REST API dokümantasyonu")
                        .contact(new Contact()
                                .name("Complaint Management Team")
                                .email("support@complaintmanagement.gov")
                                .url("https://complaintmanagement.gov"))
                        .license(new License()
                                .name("Government License")
                                .url("https://complaintmanagement.gov/license")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .name("bearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}