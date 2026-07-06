package com.joba.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilitar la protección CSRF (común en APIs REST)
            .csrf(csrf -> csrf.disable())
            
            // 2. Habilitar CORS a nivel de seguridad para que lea tu CorsConfig.java
            .cors(cors -> cors.configure(http))
            
            // 3. Permitir que TODAS las peticiones pasen sin pedir token ni contraseña
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }
}