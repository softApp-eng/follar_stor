package com.follar.repository;

import com.follar.model.SiteSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingsRepository extends JpaRepository<SiteSettingsEntity, Long> {
}
