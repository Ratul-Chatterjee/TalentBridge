package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    private String id;
    @Column(name = "requirement_id")
    private String requirementId;
    @Column(name = "role_title")
    private String roleTitle;
    @Column(name = "position_count")
    private Integer positionCount;
    @Column(name = "individual_role_status")
    private String individualRoleStatus;
    @Column(name = "about_company", columnDefinition = "text")
    private String aboutCompany;
    @Column(name = "about_role", columnDefinition = "text")
    private String aboutRole;
    @Column(name = "required_skills", columnDefinition = "text")
    private String requiredSkills;
    @Column(name = "experience", columnDefinition = "text")
    private String experience;
    @Column(name = "compensation", columnDefinition = "text")
    private String compensation;
    @Column(name = "working_hours")
    private String workingHours;
    @Column(name = "location")
    private String location;
    @Column(name = "admin_internal_notes", columnDefinition = "text")
    private String adminInternalNotes;
    @Column(name = "created_at")
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Role() {}

    // getters/setters omitted for brevity but included
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRequirementId() { return requirementId; }
    public void setRequirementId(String requirementId) { this.requirementId = requirementId; }
    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }
    public Integer getPositionCount() { return positionCount; }
    public void setPositionCount(Integer positionCount) { this.positionCount = positionCount; }
    public String getIndividualRoleStatus() { return individualRoleStatus; }
    public void setIndividualRoleStatus(String individualRoleStatus) { this.individualRoleStatus = individualRoleStatus; }
    public String getAboutCompany() { return aboutCompany; }
    public void setAboutCompany(String aboutCompany) { this.aboutCompany = aboutCompany; }
    public String getAboutRole() { return aboutRole; }
    public void setAboutRole(String aboutRole) { this.aboutRole = aboutRole; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getCompensation() { return compensation; }
    public void setCompensation(String compensation) { this.compensation = compensation; }
    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAdminInternalNotes() { return adminInternalNotes; }
    public void setAdminInternalNotes(String adminInternalNotes) { this.adminInternalNotes = adminInternalNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
