package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "requirements")
public class Requirement {
    @Id
    private String id;
    @Column(name = "company_id")
    private String companyId;
    @Column(name = "drive_type")
    private String driveType;
    @Column(name = "overall_status")
    private String overallStatus;
    @Column(name = "partial_approval_confirmed")
    private boolean partialApprovalConfirmed;
    @Column(name = "created_at")
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Requirement() {}

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getDriveType() { return driveType; }
    public void setDriveType(String driveType) { this.driveType = driveType; }
    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    public boolean isPartialApprovalConfirmed() { return partialApprovalConfirmed; }
    public void setPartialApprovalConfirmed(boolean partialApprovalConfirmed) { this.partialApprovalConfirmed = partialApprovalConfirmed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
