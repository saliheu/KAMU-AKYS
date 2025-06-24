package gov.citizen.complaintmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the Complaint Management System
 * Dilekçe Şikayet Yönetim Sistemi
 * 
 * This system manages citizen petitions and complaints with features including:
 * - Workflow management for complaint processing
 * - Priority level assignment (Low, Medium, High, Urgent)
 * - Department routing and assignment
 * - Response tracking and notifications
 * - Document attachment support
 * - Real-time status updates
 * - Performance metrics and reporting
 */
@SpringBootApplication
@EnableScheduling
@EnableAsync
public class ComplaintManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplaintManagementApplication.class, args);
    }

}