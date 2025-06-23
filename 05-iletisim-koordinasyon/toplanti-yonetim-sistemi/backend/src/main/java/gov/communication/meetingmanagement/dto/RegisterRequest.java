package gov.communication.meetingmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Kullanıcı adı boş olamaz")
    @Size(min = 3, max = 50, message = "Kullanıcı adı 3-50 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Kullanıcı adı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir")
    private String username;
    
    @NotBlank(message = "E-posta adresi boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$", 
            message = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir")
    private String password;
    
    @NotBlank(message = "Ad boş olamaz")
    @Size(max = 100, message = "Ad en fazla 100 karakter olabilir")
    private String firstName;
    
    @NotBlank(message = "Soyad boş olamaz")
    @Size(max = 100, message = "Soyad en fazla 100 karakter olabilir")
    private String lastName;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Geçerli bir telefon numarası giriniz")
    private String phone;
    
    @Size(max = 100, message = "Ünvan en fazla 100 karakter olabilir")
    private String title;
    
    private Long departmentId;
}