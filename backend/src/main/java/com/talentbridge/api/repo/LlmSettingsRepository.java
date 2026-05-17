package com.talentbridge.api.repo;

import com.talentbridge.api.entities.LlmSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LlmSettingsRepository extends JpaRepository<LlmSettings, Long> {
}
