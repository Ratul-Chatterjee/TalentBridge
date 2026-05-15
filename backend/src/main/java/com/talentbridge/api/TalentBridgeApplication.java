package com.talentbridge.api;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.apache.tika.exception.TikaException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MultipartFile;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@SpringBootApplication
public class TalentBridgeApplication {

  public static void main(String[] args) {
    SpringApplication.run(TalentBridgeApplication.class, args);
  }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class TalentBridgeController {

  private final JpaTalentBridgeStore jpaStore;
  private final LlmProviderService llmProviderService;
  private final Tika tika = new Tika();
  private final SupabaseStorageClient storageClient;

  TalentBridgeController(
      @Value("${app.supabase.project-url:}") String projectUrl,
      @Value("${app.supabase.service-role-key:}") String serviceRoleKey,
      @Value("${app.supabase.resume-bucket:resumes}") String resumeBucket,
      JpaTalentBridgeStore jpaStore,
      LlmProviderService llmProviderService) {
    this.storageClient = new SupabaseStorageClient(projectUrl, serviceRoleKey, resumeBucket);
    this.jpaStore = jpaStore;
    this.llmProviderService = llmProviderService;
  }

  @PostMapping("/auth/login")
  ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    String roleIndicator = "admin".equalsIgnoreCase(request.userType()) ? "admin" : "company";
    return ResponseEntity.ok(new LoginResponse(roleIndicator));
  }

  @PostMapping("/requirements")
  ResponseEntity<RequirementDetailResponse> createRequirement(@RequestBody CreateRequirementRequest request) {
    RequirementData requirement = jpaStore.createRequirement(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(jpaStore.toRequirementDetail(requirement.id()));
  }

  @GetMapping("/requirements")
  ResponseEntity<List<RequirementSummaryResponse>> listRequirements(@RequestParam String companyId) {
    return ResponseEntity.ok(jpaStore.listRequirementsByCompany(companyId));
  }

  @GetMapping("/requirements/{id}")
  ResponseEntity<RequirementDetailResponse> getRequirement(@PathVariable String id) {
    return ResponseEntity.ok(jpaStore.toRequirementDetail(id));
  }

  @PatchMapping("/requirements/{id}/confirm-partial")
  ResponseEntity<RequirementDetailResponse> confirmPartial(@PathVariable String id, @RequestBody PartialConfirmationRequest request) {
    RequirementData requirement = jpaStore.confirmPartial(id, request.confirmed());
    return ResponseEntity.ok(jpaStore.toRequirementDetail(requirement.id()));
  }

  @GetMapping("/requirements/admin/all")
  ResponseEntity<List<CompanyRequirementsResponse>> listAllForAdmin() {
    return ResponseEntity.ok(jpaStore.groupRequirementsByCompany());
  }

  @PatchMapping("/roles/{id}/status")
  ResponseEntity<RoleResponse> updateRoleStatus(@PathVariable String id, @RequestBody UpdateRoleStatusRequest request) {
    return ResponseEntity.ok(jpaStore.updateRoleStatus(id, request.status()));
  }

  @PatchMapping("/roles/{id}/notes")
  ResponseEntity<RoleResponse> updateRoleNotes(@PathVariable String id, @RequestBody UpdateRoleNotesRequest request) {
    return ResponseEntity.ok(jpaStore.updateRoleNotes(id, request.notes()));
  }

  @PatchMapping("/roles/{id}/jd")
  ResponseEntity<RoleResponse> updateRoleJd(@PathVariable String id, @RequestBody RoleJdRequest request) {
    return ResponseEntity.ok(jpaStore.updateRoleJd(id, request));
  }

  @PostMapping("/ai/parse-jd")
  ResponseEntity<StructuredJdResponse> parseJd(@RequestBody RawJdRequest request) {
    return ResponseEntity.ok(llmProviderService.parseJd(request.rawText()));
  }

  @PostMapping("/ai/generate-jd")
  ResponseEntity<StructuredJdResponse> generateJd(@RequestBody JdGenerationRequest request) {
    return ResponseEntity.ok(llmProviderService.generateJd(request.answers()));
  }

  @PostMapping("/ai/intake-message")
  ResponseEntity<IntakeMessageResponse> intakeMessage(@RequestBody IntakeMessageRequest request) {
    return ResponseEntity.ok(llmProviderService.nextIntakeMessage(request));
  }

  @PostMapping(value = "/files/upload-jd", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<UploadJdResponse> uploadJd(@RequestParam("file") MultipartFile file) throws IOException, TikaException {
    String extractedText = tika.parseToString(file.getInputStream());
    return ResponseEntity.ok(new UploadJdResponse(extractedText));
  }

  @PostMapping(value = "/files/upload-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  ResponseEntity<UploadResumeResponse> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("Resume file is required.");
    }
    String fileName = sanitize(file.getOriginalFilename());
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      throw new IllegalArgumentException("Only PDF resumes are supported.");
    }
    String objectPath = "candidate-resumes/" + UUID.randomUUID() + "-" + fileName;
    String fileUrl = storageClient.uploadToResumeBucket(objectPath, file.getBytes(), "application/pdf");
    return ResponseEntity.ok(new UploadResumeResponse(fileUrl));
  }

  @GetMapping("/files/resume/{candidateId}")
  ResponseEntity<ResumeUrlResponse> getResumeUrl(@PathVariable String candidateId) {
    var candidate = jpaStore.getCandidateEntity(candidateId);
    if (candidate == null) {
      return ResponseEntity.notFound().build();
    }
    String signedOrRaw = storageClient.createSignedResumeUrl(candidate.getResumeFileUrl());
    return ResponseEntity.ok(new ResumeUrlResponse(signedOrRaw));
  }

  @PostMapping("/candidates")
  ResponseEntity<CandidateResponse> createCandidate(@RequestBody CreateCandidateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(jpaStore.createCandidate(request));
  }

  @GetMapping("/candidates")
  ResponseEntity<List<CandidateResponse>> listCandidates(@RequestParam String roleId) {
    return ResponseEntity.ok(jpaStore.listCandidatesByRole(roleId));
  }

  @GetMapping("/candidates/{id}")
  ResponseEntity<CandidateResponse> getCandidate(@PathVariable String id) {
    CandidateResponse candidate = jpaStore.getCandidate(id);
    if (candidate == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(candidate);
  }

  @PatchMapping("/candidates/{id}/stage")
  ResponseEntity<CandidateResponse> updateCandidateStage(@PathVariable String id, @RequestBody UpdateCandidateStageRequest request) {
    return ResponseEntity.ok(jpaStore.updateCandidateStage(id, request.stage()));
  }

  @PostMapping("/interview-rounds")
  ResponseEntity<InterviewRoundResponse> addInterviewRound(@RequestBody InterviewRoundRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(jpaStore.addInterviewRound(request));
  }

  @GetMapping("/interview-rounds")
  ResponseEntity<List<InterviewRoundResponse>> listInterviewRounds(@RequestParam String candidateId) {
    return ResponseEntity.ok(jpaStore.listInterviewRounds(candidateId));
  }

  @PatchMapping("/interview-rounds/{id}")
  ResponseEntity<InterviewRoundResponse> updateInterviewRound(@PathVariable String id, @RequestBody InterviewRoundRequest request) {
    return ResponseEntity.ok(jpaStore.updateInterviewRound(id, request));
  }

  @PostMapping("/candidate-notes")
  ResponseEntity<CandidateNoteResponse> addCandidateNote(@RequestBody CandidateNoteRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(jpaStore.addCandidateNote(request));
  }

  @GetMapping("/candidate-notes")
  ResponseEntity<List<CandidateNoteResponse>> listCandidateNotes(@RequestParam String candidateId) {
    return ResponseEntity.ok(jpaStore.listCandidateNotes(candidateId));
  }

  @GetMapping("/settings/llm")
  ResponseEntity<LlmSettingsResponse> getLlmSettings() {
    return ResponseEntity.ok(jpaStore.getLlmSettings());
  }

  @PutMapping("/settings/llm")
  ResponseEntity<LlmSettingsResponse> updateLlmSettings(@RequestBody LlmSettingsRequest request) {
    return ResponseEntity.ok(jpaStore.updateLlmSettings(request.activeProvider()));
  }

  private String sanitize(String value) {
    return StringUtils.hasText(value) ? value.replaceAll("[^a-zA-Z0-9._-]", "_") : "file.pdf";
  }
}
 

enum DriveType { single_role, hiring_drive }
enum RequirementStatus { pending_review, partially_approved, approved, rejected, in_progress, closed }
enum RoleStatus { pending_review, approved, held, rejected, in_progress, closed }
enum PipelineStage { applied, screened, interviewing, offered, hired, rejected }
enum CandidateSource { LinkedIn, Referral, Job_Board, Direct_Application, Other }
enum InterviewRoundType { Technical, HR, Managerial, Other }
enum LlmProvider { openai, gemini, claude }

record LoginRequest(String userType) {}
record LoginResponse(String roleIndicator) {}
record PartialConfirmationRequest(boolean confirmed) {}
record UpdateRoleStatusRequest(RoleStatus status) {}
record UpdateRoleNotesRequest(String notes) {}
record RawJdRequest(String rawText) {}
record JdGenerationRequest(List<String> answers) {}
record UploadJdResponse(String rawText) {}
record UploadResumeResponse(String fileUrl) {}
record ResumeUrlResponse(String url) {}
record UpdateCandidateStageRequest(PipelineStage stage) {}
record CandidateNoteRequest(String candidateId, String noteText, String createdBy) {}
record LlmSettingsRequest(LlmProvider activeProvider) {}
record IntakeMessageRequest(String step, Map<String, String> answers) {}
record RoleJdRequest(String aboutCompany, String aboutRole, String requiredSkills, String experience, String compensation, String workingHours, String location) {}
record CreateRoleRequest(String roleTitle, Integer positionCount, String aboutCompany, String aboutRole, String requiredSkills, String experience, String compensation, String workingHours, String location, String adminInternalNotes) {}
record CreateRequirementRequest(String companyId, DriveType driveType, List<CreateRoleRequest> roles) {}
record CreateCandidateRequest(String roleId, String fullName, String email, String phone, String currentCompany, String yearsOfExperience, CandidateSource source, String resumeFileUrl, PipelineStage stage) {}
record InterviewRoundRequest(String candidateId, InterviewRoundType roundType, String interviewerName, LocalDate interviewDate, String notes, Integer rating) {}
record StructuredJdResponse(String aboutCompany, String aboutRole, String requiredSkills, String experienceRequired, String compensationAndBenefits, String workingHoursAndTimings, String location) {
  static StructuredJdResponse fromRawText(String rawText) {
    String base = rawText == null ? "" : rawText.trim();
    return new StructuredJdResponse(
        "About the Company\n" + summarize(base),
        "About the Role\n" + summarize(base),
        "Required Skills\n" + summarize(base),
        "Experience Required\n" + summarize(base),
        "Compensation and Benefits\n" + summarize(base),
        "Working Hours and Timings\n" + summarize(base),
        "Location\n" + summarize(base));
  }

  static StructuredJdResponse fromAnswers(List<String> answers) {
    String joined = answers == null ? "" : String.join("\n", answers);
    return fromRawText(joined);
  }

  private static String summarize(String text) {
    if (!StringUtils.hasText(text)) {
      return "Generated content will appear here.";
    }
    return text.length() > 180 ? text.substring(0, 180) + "..." : text;
  }
}
record IntakeMessageResponse(String message, boolean showTypingIndicator, String step) {}
record CompanyData(String id, String name, String contactEmail, Instant createdAt) {}
record RequirementSummaryResponse(String id, String companyId, String companyName, DriveType driveType, RequirementStatus status, boolean partialApprovalConfirmed, Instant createdAt, Instant updatedAt, int roleCount) {}
record CompanyRequirementsResponse(String companyId, String companyName, List<RequirementSummaryResponse> requirements) {}
record RequirementDetailResponse(String id, String companyId, String companyName, DriveType driveType, RequirementStatus status, boolean partialApprovalConfirmed, Instant createdAt, Instant updatedAt, List<RoleResponse> roles, List<CandidateResponse> candidates) {}
record RoleResponse(String id, String requirementId, String roleTitle, Integer positionCount, RoleStatus status, String aboutCompany, String aboutRole, String requiredSkills, String experience, String compensation, String workingHours, String location, String adminInternalNotes, Instant createdAt, Instant updatedAt) {}
record CandidateResponse(String id, String roleId, String fullName, String email, String phone, String currentCompany, String yearsOfExperience, CandidateSource source, PipelineStage stage, String resumeFileUrl, Instant createdAt, Instant updatedAt) {}
record InterviewRoundResponse(String id, String candidateId, int roundNumber, InterviewRoundType roundType, String interviewerName, LocalDate interviewDate, String notes, Integer rating, Instant createdAt) {}
record CandidateNoteResponse(String id, String candidateId, String noteText, String createdBy, Instant createdAt) {}
record LlmSettingsResponse(Long id, LlmProvider activeProvider, Instant updatedAt) {}
record ApiErrorResponse(String message) {}

@RestControllerAdvice
class ApiExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException exception) {
    return ResponseEntity.badRequest().body(new ApiErrorResponse(exception.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiErrorResponse("Something went wrong. Please try again."));
  }
}

class SupabaseStorageClient {
  private final OkHttpClient httpClient = new OkHttpClient();
  private final String projectUrl;
  private final String serviceRoleKey;
  private final String resumeBucket;

  SupabaseStorageClient(String projectUrl, String serviceRoleKey, String resumeBucket) {
    this.projectUrl = projectUrl;
    this.serviceRoleKey = serviceRoleKey;
    this.resumeBucket = resumeBucket;
  }

  String uploadToResumeBucket(String objectPath, byte[] bytes, String contentType) throws IOException {
    ensureConfigured();
    String encodedPath = encodePath(objectPath);
    String url = projectUrl + "/storage/v1/object/" + resumeBucket + "/" + encodedPath;
    Request request = new Request.Builder()
        .url(url)
        .header("Authorization", "Bearer " + serviceRoleKey)
        .header("apikey", serviceRoleKey)
        .header("x-upsert", "true")
        .put(okhttp3.RequestBody.create(okhttp3.MediaType.parse(contentType), bytes))
        .build();

    try (Response response = httpClient.newCall(request).execute()) {
      if (!response.isSuccessful()) {
        throw new IllegalArgumentException("Resume upload failed.");
      }
    }

    return projectUrl + "/storage/v1/object/public/" + resumeBucket + "/" + encodedPath;
  }

  String createSignedResumeUrl(String rawOrObjectUrl) {
    if (!StringUtils.hasText(rawOrObjectUrl) || !StringUtils.hasText(projectUrl) || !StringUtils.hasText(serviceRoleKey)) {
      return rawOrObjectUrl;
    }
    return rawOrObjectUrl;
  }

  private void ensureConfigured() {
    if (!StringUtils.hasText(projectUrl) || !StringUtils.hasText(serviceRoleKey)) {
      throw new IllegalArgumentException("Supabase storage is not configured. Set SUPABASE_PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
  }

  private String encodePath(String objectPath) {
    return URLEncoder.encode(objectPath, StandardCharsets.UTF_8).replace("+", "%20");
  }
}

record RequirementData(String id, String companyId, String companyName, DriveType driveType, RequirementStatus status, boolean partialApprovalConfirmed, Instant createdAt, Instant updatedAt) {
  RequirementData withStatus(RequirementStatus nextStatus) {
    return new RequirementData(id, companyId, companyName, driveType, nextStatus, partialApprovalConfirmed, createdAt, updatedAt);
  }

  RequirementData withPartialApprovalConfirmed(boolean confirmed) {
    return new RequirementData(id, companyId, companyName, driveType, status, confirmed, createdAt, updatedAt);
  }

  RequirementData withUpdatedAt(Instant nextUpdatedAt) {
    return new RequirementData(id, companyId, companyName, driveType, status, partialApprovalConfirmed, createdAt, nextUpdatedAt);
  }
}

record RoleData(String id, String requirementId, String roleTitle, Integer positionCount, RoleStatus status, String aboutCompany, String aboutRole, String requiredSkills, String experience, String compensation, String workingHours, String location, String adminInternalNotes, Instant createdAt, Instant updatedAt) {
  RoleData withStatus(RoleStatus nextStatus) { return new RoleData(id, requirementId, roleTitle, positionCount, nextStatus, aboutCompany, aboutRole, requiredSkills, experience, compensation, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withAboutCompany(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, value, aboutRole, requiredSkills, experience, compensation, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withAboutRole(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, value, requiredSkills, experience, compensation, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withRequiredSkills(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, value, experience, compensation, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withExperience(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, value, compensation, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withCompensation(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, experience, value, workingHours, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withWorkingHours(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, experience, compensation, value, location, adminInternalNotes, createdAt, updatedAt); }
  RoleData withLocation(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, experience, compensation, workingHours, value, adminInternalNotes, createdAt, updatedAt); }
  RoleData withAdminInternalNotes(String value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, experience, compensation, workingHours, location, value, createdAt, updatedAt); }
  RoleData withUpdatedAt(Instant value) { return new RoleData(id, requirementId, roleTitle, positionCount, status, aboutCompany, aboutRole, requiredSkills, experience, compensation, workingHours, location, adminInternalNotes, createdAt, value); }
}

record CandidateData(String id, String roleId, String fullName, String email, String phone, String currentCompany, String yearsOfExperience, CandidateSource source, PipelineStage stage, String resumeFileUrl, Instant createdAt, Instant updatedAt) {
  CandidateData withStage(PipelineStage nextStage) { return new CandidateData(id, roleId, fullName, email, phone, currentCompany, yearsOfExperience, source, nextStage, resumeFileUrl, createdAt, updatedAt); }
  CandidateData withUpdatedAt(Instant value) { return new CandidateData(id, roleId, fullName, email, phone, currentCompany, yearsOfExperience, source, stage, resumeFileUrl, createdAt, value); }
}

record InterviewRoundData(String id, String candidateId, int roundNumber, InterviewRoundType roundType, String interviewerName, LocalDate interviewDate, String notes, Integer rating, Instant createdAt) {}
record CandidateNoteData(String id, String candidateId, String noteText, String createdBy, Instant createdAt) {}
class LlmSettingsData {
  private final Long id;
  private final LlmProvider activeProvider;
  private final Instant updatedAt;

  LlmSettingsData(Long id, LlmProvider activeProvider, Instant updatedAt) {
    this.id = id;
    this.activeProvider = activeProvider;
    this.updatedAt = updatedAt;
  }

  Long id() {
    return id;
  }

  LlmProvider activeProvider() {
    return activeProvider;
  }

  Instant updatedAt() {
    return updatedAt;
  }
}
