package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "candidates")
public class Candidate {
    @Id
    private String id;
    @Column(name = "role_id")
    private String roleId;
    @Column(name = "full_name")
    private String fullName;
    private String email;
    private String phone;
    @Column(name = "current_company")
    private String currentCompany;
    @Column(name = "years_of_experience")
    private String yearsOfExperience;
    private String source;
    @Column(name = "current_pipeline_stage")
    private String currentPipelineStage;
    @Column(name = "resume_file_url", columnDefinition = "text")
    private String resumeFileUrl;
    @Column(name = "created_at")
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Candidate() {}
    // getters/setters omitted for brevity
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
    public String getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(String yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getCurrentPipelineStage() { return currentPipelineStage; }
    public void setCurrentPipelineStage(String currentPipelineStage) { this.currentPipelineStage = currentPipelineStage; }
    public String getResumeFileUrl() { return resumeFileUrl; }
    public void setResumeFileUrl(String resumeFileUrl) { this.resumeFileUrl = resumeFileUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
