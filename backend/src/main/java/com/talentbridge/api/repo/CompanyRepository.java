package com.talentbridge.api.repo;

import com.talentbridge.api.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, String> {
}
