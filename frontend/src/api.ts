import axios from 'axios';

// Strip trailing slashes to prevent double-slash URLs (e.g. app//api)
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://talentbridge-production-9311.up.railway.app';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching backend DTOs
export interface Requirement {
  id: string;
  companyId: string;
  driveType: 'single_role' | 'hiring_drive';
  status: 'pending_review' | 'partially_approved' | 'approved' | 'rejected' | 'in_progress' | 'closed';
  partialApprovalConfirmed?: boolean;
  roles?: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface StructuredJdResponse {
  aboutCompany: string;
  aboutRole: string;
  requiredSkills: string;
  experienceRequired: string;
  compensationAndBenefits: string;
  workingHoursAndTimings: string;
  location: string;
}

export interface CreateRoleRequest {
  roleTitle: string;
  positionCount: number;
  aboutCompany: string;
  aboutRole: string;
  requiredSkills: string;
  experience: string;
  compensation: string;
  workingHours: string;
  location: string;
  adminInternalNotes: string;
}

export interface CreateRequirementRequest {
  companyId: string;
  driveType: 'single_role' | 'hiring_drive';
  roles: CreateRoleRequest[];
}

export interface RequirementSummaryResponse {
  id: string;
  companyId: string;
  companyName: string;
  driveType: 'single_role' | 'hiring_drive';
  status: Requirement['status'];
  partialApprovalConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  roleCount: number;
}

export interface RequirementDetailResponse {
  id: string;
  companyId: string;
  companyName: string;
  driveType: 'single_role' | 'hiring_drive';
  status: Requirement['status'];
  partialApprovalConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  candidates: Candidate[];
}

export interface CompanyRequirementsResponse {
  companyId: string;
  companyName: string;
  requirements: RequirementSummaryResponse[];
}

export interface Role {
  id: string;
  requirementId: string;
  roleTitle: string;
  positionCount: number;
  status: 'pending_review' | 'approved' | 'held' | 'rejected' | 'in_progress' | 'closed';
  aboutCompany?: string;
  aboutRole?: string;
  requiredSkills?: string;
  experience?: string;
  compensation?: string;
  workingHours?: string;
  location?: string;
  adminInternalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  roleId: string;
  fullName: string;
  email: string;
  phone?: string;
  currentCompany?: string;
  yearsOfExperience?: string;
  source?: string;
  stage: 'applied' | 'screened' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  resumeFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewRound {
  id: string;
  candidateId: string;
  roundNumber: number;
  roundType?: string;
  interviewerName?: string;
  interviewDate?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface LlmSettings {
  id: number;
  activeProvider: 'openai' | 'gemini' | 'claude';
  updatedAt: string;
}

// Auth
export const login = (email: string, password?: string) => 
  // Backend expects { userType: string } for mock auth
  api.post<{ roleIndicator: string }>('/auth/login', { userType: email.includes('admin') ? 'admin' : 'company' });

// Requirements
export const createRequirement = (data: any) => 
  api.post<RequirementDetailResponse>('/requirements', data);

export const getRequirements = (companyId: string) => 
  api.get<RequirementSummaryResponse[]>('/requirements', { params: { companyId } });

export const getRequirement = (id: string) => 
  api.get<RequirementDetailResponse>(`/requirements/${id}`);

export const confirmPartialApproval = (id: string) =>
  api.patch<RequirementDetailResponse>(`/requirements/${id}/confirm-partial`, { confirmed: true });

// Admin Requirements
export const getAllRequirementsAdmin = () =>
  api.get<CompanyRequirementsResponse[]>('/requirements/admin/all');

export const updateRequirementStatus = (id: string, status: string) =>
  api.patch<RequirementSummaryResponse>(`/requirements/${id}/status`, { status });

// Roles
export const updateRoleStatus = (roleId: string, status: string) =>
  api.patch<Role>(`/roles/${roleId}/status`, { status });

export const updateRoleNotes = (roleId: string, notes: string) =>
  api.patch<Role>(`/roles/${roleId}/notes`, { notes });

// Candidates
export const createCandidate = (data: any) =>
  api.post<Candidate>('/candidates', data);

export const getCandidatesByRole = (roleId: string) =>
  api.get<Candidate[]>('/candidates', { params: { roleId } });

export const getCandidate = (candidateId: string) =>
  api.get<Candidate>(`/candidates/${candidateId}`);

export const updateCandidateStage = (candidateId: string, stage: string) =>
  api.patch<Candidate>(`/candidates/${candidateId}/stage`, { stage });

// Interview Rounds
export const addInterviewRound = (candidateId: string, data: any) =>
  api.post<InterviewRound>('/interview-rounds', { ...data, candidateId });

export const getInterviewRounds = (candidateId: string) =>
  api.get<InterviewRound[]>('/interview-rounds', { params: { candidateId } });

export const updateInterviewRound = (roundId: string, data: any) =>
  api.patch<InterviewRound>(`/interview-rounds/${roundId}`, data);

// Candidate Notes
export const addCandidateNote = (candidateId: string, text: string, createdBy: string = 'admin') =>
  api.post('/candidate-notes', { candidateId, noteText: text, createdBy });

export const getCandidateNotes = (candidateId: string) =>
  api.get('/candidate-notes', { params: { candidateId } });

// File Upload
export const uploadJD = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ rawText: string }>('/files/upload-jd', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ fileUrl: string }>('/files/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getResumeUrl = (candidateId: string) =>
  api.get<{ url: string }>(`/files/resume/${candidateId}`);

// AI Features
export const parseJD = (jdText: string) =>
  api.post('/ai/parse-jd', { rawText: jdText });

export const generateJD = (answers: string[]) =>
  api.post<StructuredJdResponse>('/ai/generate-jd', { answers });

export const getIntakeMessage = (currentStep: string, answers?: Record<string, string>) =>
  api.post('/ai/intake-message', { step: currentStep, answers: answers || {} });

// LLM Settings
export const getLlmSettings = () =>
  api.get<LlmSettings>('/settings/llm');

export const updateLlmSettings = (activeProvider: 'openai' | 'gemini' | 'claude') =>
  api.put<LlmSettings>('/settings/llm', { activeProvider });

export default api;
