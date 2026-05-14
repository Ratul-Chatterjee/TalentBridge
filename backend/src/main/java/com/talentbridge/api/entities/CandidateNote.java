package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "candidate_notes")
public class CandidateNote {
    @Id
    private String id;
    @Column(name = "candidate_id")
    private String candidateId;
    @Column(name = "note_text", columnDefinition = "text")
    private String noteText;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at")
    private Instant createdAt;

    public CandidateNote() {}
    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }
    public String getNoteText() { return noteText; }
    public void setNoteText(String noteText) { this.noteText = noteText; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
