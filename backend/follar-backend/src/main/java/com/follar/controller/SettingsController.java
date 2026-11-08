package com.follar.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.follar.model.SiteSettingsEntity;
import com.follar.repository.SiteSettingsRepository;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Persists the admin appearance settings (site name, palette, social links,
 * sur-mesure photos) in the H2 database.
 */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private static final long SINGLETON_ID = 1L;

    private final SiteSettingsRepository repository;
    private final ObjectMapper objectMapper;

    public SettingsController(SiteSettingsRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public Map<String, Object> get() {
        return repository.findById(SINGLETON_ID)
                .map(entity -> readPayload(entity.getPayload()))
                .orElseGet(Collections::emptyMap);
    }

    @PutMapping
    public Map<String, Object> save(@RequestBody Map<String, Object> settings) {
        SiteSettingsEntity entity = repository.findById(SINGLETON_ID)
                .orElseGet(() -> {
                    SiteSettingsEntity created = new SiteSettingsEntity();
                    created.setId(SINGLETON_ID);
                    return created;
                });

        try {
            entity.setPayload(objectMapper.writeValueAsString(settings));
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid settings payload", exception);
        }
        entity.setUpdatedAt(Instant.now());
        repository.save(entity);
        return settings;
    }

    private Map<String, Object> readPayload(String payload) {
        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException exception) {
            return Collections.emptyMap();
        }
    }
}
