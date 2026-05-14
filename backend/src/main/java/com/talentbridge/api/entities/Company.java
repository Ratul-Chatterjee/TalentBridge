package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    private String id;
    private String name;
    @Column(name = "contact_email")
    private String contactEmail;
    @Column(name = "created_at")
    private Instant createdAt;

    public Company() {}

    public Company(String id, String name, String contactEmail, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.contactEmail = contactEmail;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
