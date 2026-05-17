package com.talentbridge.api;

import com.talentbridge.api.entities.Company;
import com.talentbridge.api.repo.CompanyRepository;
import com.talentbridge.api.repo.RequirementRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Configuration
class DemoDataSeeder {

    @Bean
    ApplicationRunner seedDemoData(JpaTalentBridgeStore store, CompanyRepository companyRepository, RequirementRepository requirementRepository) {
        return args -> {
            if (requirementRepository.count() > 0) {
                return;
            }

            companyRepository.save(companyRepository.findById("comp-123").orElseGet(() -> {
                Company company = new Company();
                company.setId("comp-123");
                company.setName("Nova Retail Group");
                company.setContactEmail("hiring@novaretail.example");
                company.setCreatedAt(Instant.now());
                return company;
            }));

                RequirementData requirement = store.createRequirement(new CreateRequirementRequest(
                    "comp-123",
                    DriveType.single_role,
                    List.of(new CreateRoleRequest(
                            "Frontend Engineer",
                            2,
                            "Nova Retail Group",
                            "Build and maintain the TalentBridge frontend and hiring workflows.",
                            "React, TypeScript, Material UI, API integration",
                            "2+ years",
                            "Competitive salary, benefits, and learning budget",
                            "Full-time",
                            "Remote",
                            "Seeded demo data for dashboard visibility"
                    ))
            ));

            RequirementDetailResponse requirementDetail = store.toRequirementDetail(requirement.id());

            if (!requirementDetail.roles().isEmpty()) {
                RoleResponse role = requirementDetail.roles().get(0);
                CandidateResponse candidate = store.createCandidate(new CreateCandidateRequest(
                        role.id(),
                        "Aarav Sharma",
                        "aarav.sharma@example.com",
                        "+91 98765 43210",
                        "Orbit Labs",
                        "3 years",
                        CandidateSource.LinkedIn,
                        null,
                        PipelineStage.applied
                ));

                store.addInterviewRound(new InterviewRoundRequest(
                        candidate.id(),
                        InterviewRoundType.Technical,
                        "Priya Mehta",
                        LocalDate.now().plusDays(1),
                        "Initial technical screening",
                        4
                ));
            }
        };
    }
}