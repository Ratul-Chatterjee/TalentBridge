package com.talentbridge.api.repo;

import com.talentbridge.api.entities.InterviewRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRoundRepository extends JpaRepository<InterviewRound, String> {
    List<InterviewRound> findByCandidateIdOrderByRoundNumberAsc(String candidateId);
}
