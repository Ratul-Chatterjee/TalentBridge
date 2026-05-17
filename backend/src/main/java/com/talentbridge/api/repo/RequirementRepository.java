package com.talentbridge.api.repo;

import com.talentbridge.api.entities.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequirementRepository extends JpaRepository<Requirement, String> {
    List<Requirement> findByCompanyIdOrderByCreatedAtDesc(String companyId);
}
