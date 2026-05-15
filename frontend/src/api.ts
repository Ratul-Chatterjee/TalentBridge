import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
  adminNotes?: string;
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
  yearsExperience?: number;
  source?: string;
  currentStage: 'applied' | 'screened' | 'interviewing' | 'offered' | 'hired' | 'rejected';
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
export const login = (email: string, password: string) => 
  api.post<{ token: string }>('/auth/login', { email, password });

// Requirements
export const createRequirement = (data: any) => 
  api.post<Requirement>('/requirements', data);

export const getRequirements = (companyId?: string) => 
  api.get<Requirement[]>('/requirements', { params: { companyId } });

export const getRequirement = (id: string) => 
  api.get<Requirement>(`/requirements/${id}`);

export const updateRequirementStatus = (id: string, status: string) =>
  api.patch<Requirement>(`/requirements/${id}/status`, { status });

export const confirmPartialApproval = (id: string) =>
  api.patch<Requirement>(`/requirements/${id}/confirm-partial`, { confirmed: true });

// Roles
export const getRolesByRequirement = (requirementId: string) =>
  api.get<Role[]>(`/requirements/${requirementId}/roles`);

export const updateRoleStatus = (roleId: string, status: string) =>
  api.patch<Role>(`/roles/${roleId}/status`, { status });

// Candidates
export const createCandidate = (data: any) =>
  api.post<Candidate>('/candidates', data);

export const getCandidatesByRole = (roleId: string) =>
  api.get<Candidate[]>('/candidates', { params: { roleId } });

export const getCandidate = (candidateId: string) =>
  api.get<Candidate>(`/candidates/${candidateId}`);

// Interview Rounds
export const addInterviewRound = (candidateId: string, data: any) =>
  api.post<InterviewRound>('/interview-rounds', { ...data, candidateId });

export const getInterviewRounds = (candidateId: string) =>
  api.get<InterviewRound[]>('/interview-rounds', { params: { candidateId } });

// Candidate Notes
export const addCandidateNote = (candidateId: string, text: string) =>
  api.post('/candidate-notes', { candidateId, noteText: text, createdBy: 'admin' });

// File Upload
export const uploadJD = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ fileName: string; url: string }>('/files/upload-jd', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ fileName: string; url: string }>('/files/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// AI Features
export const parseJD = (jdText: string) =>
  api.post('/ai/parse-jd', { jdText });

export const generateJD = (responses: any) =>
  api.post('/ai/generate-jd', responses);

export const getIntakeMessage = (currentStep: string) =>
  api.post('/ai/intake-message', { currentStep });

// LLM Settings
export const getLlmSettings = () =>
  api.get<LlmSettings>('/settings/llm');

export const updateLlmSettings = (activeProvider: 'openai' | 'gemini' | 'claude') =>
  api.put<LlmSettings>('/settings/llm', { activeProvider });

export default api;
