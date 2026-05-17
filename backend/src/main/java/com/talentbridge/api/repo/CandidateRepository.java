package com.talentbridge.api.repo;

import com.talentbridge.api.entities.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, String> {
    List<Candidate> findByRoleIdOrderByUpdatedAtDesc(String roleId);
    List<Candidate> findByRoleIdIn(List<String> roleIds);
}
