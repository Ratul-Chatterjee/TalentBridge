package com.talentbridge.api.repo;

import com.talentbridge.api.entities.CandidateNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateNoteRepository extends JpaRepository<CandidateNote, String> {
    List<CandidateNote> findByCandidateIdOrderByCreatedAtAsc(String candidateId);
}
