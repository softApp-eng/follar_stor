package com.follar.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves the uploaded article photos and allows the Angular dev server
 * (localhost / 127.0.0.1 on port 4200) to call the image API.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path uploads;

    public WebConfig(@Value("${follar.uploads.dir:uploads}") String uploadsDir) {
        this.uploads = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploads.toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:4200",
                        "http://127.0.0.1:4200",
                        "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");

        registry.addMapping("/uploads/**")
                .allowedOrigins("*")
                .allowedMethods("GET");
    }
}
