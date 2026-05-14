package com.talentbridge.api.entities;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "interview_rounds")
public class InterviewRound {
    @Id
    private String id;
    @Column(name = "candidate_id")
    private String candidateId;
    @Column(name = "round_number")
    private Integer roundNumber;
    @Column(name = "round_type")
    private String roundType;
    @Column(name = "interviewer_name")
    private String interviewerName;
    @Column(name = "interview_date")
    private LocalDate interviewDate;
    @Column(name = "notes", columnDefinition = "text")
    private String notes;
    private Integer rating;
    @Column(name = "created_at")
    private Instant createdAt;

    public InterviewRound() {}
    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }
    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
    public String getRoundType() { return roundType; }
    public void setRoundType(String roundType) { this.roundType = roundType; }
    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    public LocalDate getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDate interviewDate) { this.interviewDate = interviewDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
