package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "llm_settings")
public class LlmSettings {
    @Id
    private Long id;
    @Column(name = "active_provider")
    private String activeProvider;
    @Column(name = "updated_at")
    private Instant updatedAt;

    public LlmSettings() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getActiveProvider() { return activeProvider; }
    public void setActiveProvider(String activeProvider) { this.activeProvider = activeProvider; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
