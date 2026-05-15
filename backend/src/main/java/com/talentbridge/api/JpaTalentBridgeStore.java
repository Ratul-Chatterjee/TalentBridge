package com.talentbridge.api;

import com.talentbridge.api.entities.*;
import com.talentbridge.api.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class JpaTalentBridgeStore {
    private final CompanyRepository companyRepo;
    private final RequirementRepository requirementRepo;
    private final RoleRepository roleRepo;
    private final CandidateRepository candidateRepo;
    private final InterviewRoundRepository interviewRepo;
    private final CandidateNoteRepository noteRepo;
    private final LlmSettingsRepository llmRepo;

    public JpaTalentBridgeStore(CompanyRepository companyRepo, RequirementRepository requirementRepo, RoleRepository roleRepo, CandidateRepository candidateRepo, InterviewRoundRepository interviewRepo, CandidateNoteRepository noteRepo, LlmSettingsRepository llmRepo) {
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.roleRepo = roleRepo;
        this.candidateRepo = candidateRepo;
        this.interviewRepo = interviewRepo;
        this.noteRepo = noteRepo;
        this.llmRepo = llmRepo;
    }

    public RequirementData createRequirement(CreateRequirementRequest request) {
        String id = "req-" + UUID.randomUUID();
        Company company = companyRepo.findById(request.companyId()).orElseGet(() -> {
            Company newCompany = new Company();
            newCompany.setId(request.companyId());
            newCompany.setName("Company " + request.companyId());
            newCompany.setContactEmail("unknown@company.local");
            newCompany.setCreatedAt(Instant.now());
            return newCompany;
        });
        companyRepo.save(company);
        Requirement requirement = new Requirement();
        requirement.setId(id);
        requirement.setCompanyId(company.getId());
        requirement.setDriveType(request.driveType().name());
        requirement.setOverallStatus("pending_review");
        requirement.setPartialApprovalConfirmed(false);
        requirement.setCreatedAt(Instant.now());
        requirement.setUpdatedAt(Instant.now());
        requirementRepo.save(requirement);
        for (CreateRoleRequest r : request.roles()) {
            Role role = new Role();
            role.setId("role-" + UUID.randomUUID());
            role.setRequirementId(id);
            role.setRoleTitle(r.roleTitle());
            role.setPositionCount(r.positionCount());
            role.setIndividualRoleStatus("pending_review");
            role.setAboutCompany(r.aboutCompany());
            role.setAboutRole(r.aboutRole());
            role.setRequiredSkills(r.requiredSkills());
            role.setExperience(r.experience());
            role.setCompensation(r.compensation());
            role.setWorkingHours(r.workingHours());
            role.setLocation(r.location());
            role.setAdminInternalNotes(r.adminInternalNotes());
            role.setCreatedAt(Instant.now());
            role.setUpdatedAt(Instant.now());
            roleRepo.save(role);
        }
        return new RequirementData(requirement.getId(), requirement.getCompanyId(), company.getName(), DriveType.valueOf(requirement.getDriveType()), RequirementStatus.pending_review, requirement.isPartialApprovalConfirmed(), requirement.getCreatedAt(), requirement.getUpdatedAt());
    }

    public List<RequirementSummaryResponse> listRequirementsByCompany(String companyId) {
        List<Requirement> list = requirementRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
        return list.stream().map(r -> new RequirementSummaryResponse(r.getId(), r.getCompanyId(), companyRepo.findById(r.getCompanyId()).map(Company::getName).orElse(""), DriveType.valueOf(r.getDriveType()), RequirementStatus.valueOf(r.getOverallStatus()), r.isPartialApprovalConfirmed(), r.getCreatedAt(), r.getUpdatedAt(), roleRepo.findByRequirementIdOrderByCreatedAtAsc(r.getId()).size())).collect(Collectors.toList());
    }

    public List<RequirementSummaryResponse> listRequirements(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            return requirementRepo.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(r -> new RequirementSummaryResponse(
                    r.getId(),
                    r.getCompanyId(),
                    companyRepo.findById(r.getCompanyId()).map(Company::getName).orElse(""),
                    DriveType.valueOf(r.getDriveType()),
                    RequirementStatus.valueOf(r.getOverallStatus()),
                    r.isPartialApprovalConfirmed(),
                    r.getCreatedAt(),
                    r.getUpdatedAt(),
                    roleRepo.findByRequirementIdOrderByCreatedAtAsc(r.getId()).size()))
                .collect(Collectors.toList());
        }
        return listRequirementsByCompany(companyId);
    }

    public RequirementDetailResponse toRequirementDetail(String id) {
        Requirement r = requirementRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        List<RoleResponse> roles = roleRepo.findByRequirementIdOrderByCreatedAtAsc(id).stream().map(role -> new RoleResponse(role.getId(), role.getRequirementId(), role.getRoleTitle(), role.getPositionCount(), RoleStatus.valueOf(role.getIndividualRoleStatus()), role.getAboutCompany(), role.getAboutRole(), role.getRequiredSkills(), role.getExperience(), role.getCompensation(), role.getWorkingHours(), role.getLocation(), role.getAdminInternalNotes(), role.getCreatedAt(), role.getUpdatedAt())).collect(Collectors.toList());
        List<String> roleIds = roles.stream().map(RoleResponse::id).collect(Collectors.toList());
        List<CandidateResponse> candidates = candidateRepo.findByRoleIdIn(roleIds).stream().map(c -> new CandidateResponse(c.getId(), c.getRoleId(), c.getFullName(), c.getEmail(), c.getPhone(), c.getCurrentCompany(), c.getYearsOfExperience(), null, PipelineStage.valueOf(c.getCurrentPipelineStage()), c.getResumeFileUrl(), c.getCreatedAt(), c.getUpdatedAt())).collect(Collectors.toList());
        return new RequirementDetailResponse(r.getId(), r.getCompanyId(), companyRepo.findById(r.getCompanyId()).map(Company::getName).orElse(""), DriveType.valueOf(r.getDriveType()), RequirementStatus.valueOf(r.getOverallStatus()), r.isPartialApprovalConfirmed(), r.getCreatedAt(), r.getUpdatedAt(), roles, candidates);
    }

    public RequirementData confirmPartial(String requirementId, boolean confirmed) {
        Requirement r = requirementRepo.findById(requirementId).orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        r.setPartialApprovalConfirmed(confirmed);
        r.setUpdatedAt(Instant.now());
        requirementRepo.save(r);
        return new RequirementData(r.getId(), r.getCompanyId(), companyRepo.findById(r.getCompanyId()).map(Company::getName).orElse(""), DriveType.valueOf(r.getDriveType()), RequirementStatus.valueOf(r.getOverallStatus()), r.isPartialApprovalConfirmed(), r.getCreatedAt(), r.getUpdatedAt());
    }

    public RequirementData updateRequirementStatus(String requirementId, RequirementStatus status) {
        Requirement r = requirementRepo.findById(requirementId).orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
        r.setOverallStatus(status.name());
        r.setUpdatedAt(Instant.now());
        requirementRepo.save(r);
        return new RequirementData(
            r.getId(),
            r.getCompanyId(),
            companyRepo.findById(r.getCompanyId()).map(Company::getName).orElse(""),
            DriveType.valueOf(r.getDriveType()),
            RequirementStatus.valueOf(r.getOverallStatus()),
            r.isPartialApprovalConfirmed(),
            r.getCreatedAt(),
            r.getUpdatedAt());
    }

    public RoleResponse updateRoleStatus(String roleId, RoleStatus status) {
        Role role = roleRepo.findById(roleId).orElseThrow(() -> new IllegalArgumentException("Role not found"));
        role.setIndividualRoleStatus(status.name());
        role.setUpdatedAt(Instant.now());
        roleRepo.save(role);
        return new RoleResponse(role.getId(), role.getRequirementId(), role.getRoleTitle(), role.getPositionCount(), status, role.getAboutCompany(), role.getAboutRole(), role.getRequiredSkills(), role.getExperience(), role.getCompensation(), role.getWorkingHours(), role.getLocation(), role.getAdminInternalNotes(), role.getCreatedAt(), role.getUpdatedAt());
    }

    public RoleResponse updateRoleNotes(String roleId, String notes) {
        Role role = roleRepo.findById(roleId).orElseThrow(() -> new IllegalArgumentException("Role not found"));
        role.setAdminInternalNotes(notes);
        role.setUpdatedAt(Instant.now());
        roleRepo.save(role);
        return new RoleResponse(role.getId(), role.getRequirementId(), role.getRoleTitle(), role.getPositionCount(), RoleStatus.valueOf(role.getIndividualRoleStatus()), role.getAboutCompany(), role.getAboutRole(), role.getRequiredSkills(), role.getExperience(), role.getCompensation(), role.getWorkingHours(), role.getLocation(), role.getAdminInternalNotes(), role.getCreatedAt(), role.getUpdatedAt());
    }

    public RoleResponse updateRoleJd(String roleId, RoleJdRequest request) {
        Role role = roleRepo.findById(roleId).orElseThrow(() -> new IllegalArgumentException("Role not found"));
        role.setAboutCompany(request.aboutCompany());
        role.setAboutRole(request.aboutRole());
        role.setRequiredSkills(request.requiredSkills());
        role.setExperience(request.experience());
        role.setCompensation(request.compensation());
        role.setWorkingHours(request.workingHours());
        role.setLocation(request.location());
        role.setUpdatedAt(Instant.now());
        roleRepo.save(role);
        return new RoleResponse(role.getId(), role.getRequirementId(), role.getRoleTitle(), role.getPositionCount(), RoleStatus.valueOf(role.getIndividualRoleStatus()), role.getAboutCompany(), role.getAboutRole(), role.getRequiredSkills(), role.getExperience(), role.getCompensation(), role.getWorkingHours(), role.getLocation(), role.getAdminInternalNotes(), role.getCreatedAt(), role.getUpdatedAt());
    }

    public CandidateResponse createCandidate(CreateCandidateRequest request) {
        String id = "cand-" + UUID.randomUUID();
        Candidate c = new Candidate();
        c.setId(id);
        c.setRoleId(request.roleId());
        c.setFullName(request.fullName());
        c.setEmail(request.email());
        c.setPhone(request.phone());
        c.setCurrentCompany(request.currentCompany());
        c.setYearsOfExperience(request.yearsOfExperience());
        c.setSource(request.source() == null ? null : request.source().name());
        c.setCurrentPipelineStage(request.stage() == null ? PipelineStage.applied.name() : request.stage().name());
        c.setResumeFileUrl(request.resumeFileUrl());
        c.setCreatedAt(Instant.now());
        c.setUpdatedAt(Instant.now());
        candidateRepo.save(c);
        return new CandidateResponse(c.getId(), c.getRoleId(), c.getFullName(), c.getEmail(), c.getPhone(), c.getCurrentCompany(), c.getYearsOfExperience(), null, PipelineStage.valueOf(c.getCurrentPipelineStage()), c.getResumeFileUrl(), c.getCreatedAt(), c.getUpdatedAt());
    }

    public List<CandidateResponse> listCandidatesByRole(String roleId) {
        return candidateRepo.findByRoleIdOrderByUpdatedAtDesc(roleId).stream().map(c -> new CandidateResponse(c.getId(), c.getRoleId(), c.getFullName(), c.getEmail(), c.getPhone(), c.getCurrentCompany(), c.getYearsOfExperience(), null, PipelineStage.valueOf(c.getCurrentPipelineStage()), c.getResumeFileUrl(), c.getCreatedAt(), c.getUpdatedAt())).collect(Collectors.toList());
    }

    public CandidateResponse updateCandidateStage(String candidateId, PipelineStage stage) {
        Candidate c = candidateRepo.findById(candidateId).orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        c.setCurrentPipelineStage(stage.name());
        c.setUpdatedAt(Instant.now());
        candidateRepo.save(c);
        return new CandidateResponse(c.getId(), c.getRoleId(), c.getFullName(), c.getEmail(), c.getPhone(), c.getCurrentCompany(), c.getYearsOfExperience(), null, stage, c.getResumeFileUrl(), c.getCreatedAt(), c.getUpdatedAt());
    }

    public InterviewRoundResponse addInterviewRound(InterviewRoundRequest request) {
        String id = "round-" + UUID.randomUUID();
        int roundNumber = interviewRepo.findByCandidateIdOrderByRoundNumberAsc(request.candidateId()).size() + 1;
        InterviewRound r = new InterviewRound();
        r.setId(id);
        r.setCandidateId(request.candidateId());
        r.setRoundNumber(roundNumber);
        r.setRoundType(request.roundType().name());
        r.setInterviewerName(request.interviewerName());
        r.setInterviewDate(request.interviewDate());
        r.setNotes(request.notes());
        r.setRating(request.rating());
        r.setCreatedAt(Instant.now());
        interviewRepo.save(r);
        return new InterviewRoundResponse(r.getId(), r.getCandidateId(), r.getRoundNumber(), request.roundType(), r.getInterviewerName(), r.getInterviewDate(), r.getNotes(), r.getRating(), r.getCreatedAt());
    }

    public List<InterviewRoundResponse> listInterviewRounds(String candidateId) {
        return interviewRepo.findByCandidateIdOrderByRoundNumberAsc(candidateId).stream().map(r -> new InterviewRoundResponse(r.getId(), r.getCandidateId(), r.getRoundNumber(), InterviewRoundType.valueOf(r.getRoundType()), r.getInterviewerName(), r.getInterviewDate(), r.getNotes(), r.getRating(), r.getCreatedAt())).collect(Collectors.toList());
    }

    public InterviewRoundResponse updateInterviewRound(String roundId, InterviewRoundRequest request) {
        InterviewRound existing = interviewRepo.findById(roundId).orElseThrow(() -> new IllegalArgumentException("Interview round not found"));
        existing.setInterviewDate(request.interviewDate());
        existing.setInterviewerName(request.interviewerName());
        existing.setNotes(request.notes());
        existing.setRating(request.rating());
        interviewRepo.save(existing);
        return new InterviewRoundResponse(existing.getId(), existing.getCandidateId(), existing.getRoundNumber(), request.roundType(), existing.getInterviewerName(), existing.getInterviewDate(), existing.getNotes(), existing.getRating(), existing.getCreatedAt());
    }

    public CandidateNoteResponse addCandidateNote(CandidateNoteRequest request) {
        String id = "note-" + UUID.randomUUID();
        CandidateNote note = new CandidateNote();
        note.setId(id);
        note.setCandidateId(request.candidateId());
        note.setNoteText(request.noteText());
        note.setCreatedBy(request.createdBy());
        note.setCreatedAt(Instant.now());
        noteRepo.save(note);
        return new CandidateNoteResponse(note.getId(), note.getCandidateId(), note.getNoteText(), note.getCreatedBy(), note.getCreatedAt());
    }

    public List<CandidateNoteResponse> listCandidateNotes(String candidateId) {
        return noteRepo.findByCandidateIdOrderByCreatedAtAsc(candidateId).stream().map(n -> new CandidateNoteResponse(n.getId(), n.getCandidateId(), n.getNoteText(), n.getCreatedBy(), n.getCreatedAt())).collect(Collectors.toList());
    }

    public LlmSettingsResponse getLlmSettings() {
        return llmRepo.findById(1L).map(l -> new LlmSettingsResponse(l.getId(), LlmProvider.valueOf(l.getActiveProvider()), l.getUpdatedAt())).orElseGet(() -> new LlmSettingsResponse(1L, LlmProvider.openai, Instant.now()));
    }

    public LlmSettingsResponse updateLlmSettings(LlmProvider provider) {
        LlmSettings s = llmRepo.findById(1L).orElseGet(() -> { LlmSettings ns = new LlmSettings(); ns.setId(1L); return ns;});
        s.setActiveProvider(provider.name());
        s.setUpdatedAt(Instant.now());
        llmRepo.save(s);
        return new LlmSettingsResponse(s.getId(), LlmProvider.valueOf(s.getActiveProvider()), s.getUpdatedAt());
    }

    public CandidateResponse getCandidate(String candidateId) {
        return candidateRepo.findById(candidateId).map(this::toCandidateResponse).orElse(null);
    }

    public Candidate getCandidateEntity(String candidateId) {
        return candidateRepo.findById(candidateId).orElse(null);
    }

    private CandidateResponse toCandidateResponse(Candidate c) {
        return new CandidateResponse(c.getId(), c.getRoleId(), c.getFullName(), c.getEmail(), c.getPhone(), c.getCurrentCompany(), c.getYearsOfExperience(), null, PipelineStage.valueOf(c.getCurrentPipelineStage()), c.getResumeFileUrl(), c.getCreatedAt(), c.getUpdatedAt());
    }

    public List<CompanyRequirementsResponse> groupRequirementsByCompany() {
        return companyRepo.findAll().stream()
            .map(company -> new CompanyRequirementsResponse(
                company.getId(),
                company.getName(),
                listRequirementsByCompany(company.getId())))
            .sorted((a, b) -> a.companyName().compareToIgnoreCase(b.companyName()))
            .collect(Collectors.toList());
    }
}
