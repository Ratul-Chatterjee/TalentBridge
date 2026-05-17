// Landing page component deployed
import { useState, useEffect } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { ChangeEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from './auth';
import * as apiClient from './api';
import type { Requirement, Candidate, Role, LlmSettings, StructuredJdResponse, RequirementSummaryResponse, RequirementDetailResponse, CompanyRequirementsResponse } from './api';

type ChatMessage = {
  from: 'ai' | 'user';
  text: string;
};

const COMPANY_ID = 'comp-123';

const STOCK_IMAGE_TEAM = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';
const STOCK_IMAGE_REVIEW = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80';

function WorkflowIllustration({ title, description, accent }: { title: string; description: string; accent: string }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            mb: 2,
            display: 'grid',
            placeItems: 'center',
            background: accent,
            color: 'common.white',
          }}
        >
          <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
            <circle cx="20" cy="22" r="6" fill="currentColor" opacity="0.95" />
            <rect x="12" y="31" width="16" height="18" rx="4" fill="currentColor" opacity="0.85" />
            <rect x="34" y="14" width="18" height="10" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="34" y="30" width="18" height="10" rx="3" fill="currentColor" opacity="0.8" />
            <path d="M29 25h5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M29 40h5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function App({ mode, onToggleMode }: { mode: 'light' | 'dark'; onToggleMode: () => void }) {
  const { userType, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (!userType) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={userType === 'admin' ? '/admin' : '/company'} replace />} />
      <Route element={<AppShell mode={mode} onToggleMode={onToggleMode} onLogout={() => { logout(); navigate('/', { replace: true }); }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}>
        <Route path="/" element={<Navigate to={userType === 'admin' ? '/admin' : '/company'} replace />} />
        <Route path="/company" element={<RequireRole allowed="company"><CompanyDashboard /></RequireRole>} />
        <Route path="/company/intake" element={<RequireRole allowed="company"><IntakeFlow /></RequireRole>} />
        <Route path="/company/requirements/:id" element={<RequireRole allowed="company"><RequirementDetail /></RequireRole>} />
        <Route path="/admin" element={<RequireRole allowed="admin"><AdminDashboard /></RequireRole>} />
        <Route path="/admin/requirements" element={<RequireRole allowed="admin"><AdminRequirements /></RequireRole>} />
        <Route path="/admin/pipeline/:roleId" element={<RequireRole allowed="admin"><PipelineManagement /></RequireRole>} />
        <Route path="/admin/settings/llm" element={<RequireRole allowed="admin"><LlmSettings /></RequireRole>} />
      </Route>
    </Routes>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 8 },
        background: 'linear-gradient(180deg, rgba(13,27,42,0.04) 0%, rgba(255,255,255,0) 40%)',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Chip label="AI hiring workspace" sx={{ mb: 2, fontWeight: 700 }} />
              <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
                Build hiring workflows that feel ready for real teams.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 640 }}>
                TalentBridge helps small and mid-sized teams capture requirements, generate structured JDs, review candidates, and keep hiring decisions in one place.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/login')}>
                  Enter App
                </Button>
                <Button component="a" variant="outlined" size="large" href="https://github.com/Ratul-Chatterjee/TalentBridge" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>AI intake</Typography>
                  <Typography color="text.secondary">Guided requirement capture with structured output.</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Admin review</Typography>
                  <Typography color="text.secondary">Grouped approvals and pipeline visibility.</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>Candidate tracking</Typography>
                  <Typography color="text.secondary">Stages, interview rounds, and notes.</Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, width: '100%' }}>
              <Card
                sx={{
                  overflow: 'hidden',
                  borderRadius: 5,
                  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(37, 99, 235, 0.14))',
                  }}
                >
                  <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 800 }}>
                    TalentBridge Workspace Preview
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, mt: 1 }}>
                    From intake to review in one flow.
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box
                      component="img"
                      src={STOCK_IMAGE_TEAM}
                      alt="Hiring team reviewing candidates in a meeting"
                      sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 3 }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        component="img"
                        src={STOCK_IMAGE_REVIEW}
                        alt="Recruiter reviewing applications on a laptop"
                        sx={{ flex: 1, height: 160, objectFit: 'cover', borderRadius: 3 }}
                      />
                      <Card variant="outlined" sx={{ flex: 1, bgcolor: 'background.paper' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            Workflow snapshot
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>
                            Intake, generate, review.
                          </Typography>
                          <Typography color="text.secondary" sx={{ mt: 1 }}>
                            The same requirement appears in the company dashboard and the admin review queue.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              How it works
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <WorkflowIllustration
                title="Capture the requirement"
                description="Start with a guided intake for a single role or a hiring drive and turn rough notes into structured data."
                accent="linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)"
              />
              <WorkflowIllustration
                title="Generate the JD"
                description="AI helps shape company info, responsibilities, skills, and location into a usable brief."
                accent="linear-gradient(135deg, #0f766e 0%, #34d399 100%)"
              />
              <WorkflowIllustration
                title="Review and track"
                description="Admins see all incoming requirements, approval status, and candidate movement in one place."
                accent="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)"
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Goal</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Streamline requirement intake, JD generation, and candidate pipeline management using lightweight AI assistance.</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Who Is This For</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Hiring managers, recruiters, and small HR teams who want a fast, low-friction hiring workflow.</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>What It Solves</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Reduces manual JD writing, centralizes candidate resumes, and provides an admin review flow for requirements.</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function RequireRole({ allowed, children }: { allowed: 'company' | 'admin'; children: JSX.Element }) {
  const { userType } = useAuth();
  return userType === allowed ? children : <Navigate to={allowed === 'company' ? '/company' : '/admin'} replace />;
}

function AppShell({
  mode,
  onToggleMode,
  onLogout,
  mobileOpen,
  setMobileOpen,
}: {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const { userType } = useAuth();
  const drawer = (
    <Box sx={{ p: 2, width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
        TalentBridge
      </Typography>
      <Stack spacing={1}>
        {userType === 'company' ? (
          <>
            <SideLink to="/company" label="Company Dashboard" />
            <SideLink to="/company/intake" label="New Requirement" />
          </>
        ) : (
          <>
            <SideLink to="/admin" label="Admin Dashboard" />
            <SideLink to="/admin/requirements" label="Requirements Review" />
            <SideLink to="/admin/settings/llm" label="LLM Settings" />
          </>
        )}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 1, display: { md: 'none' } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            TalentBridge
          </Typography>
          <IconButton onClick={onToggleMode} sx={{ mr: 1 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} variant="temporary">
        {drawer}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { position: 'relative' } }} open>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{ justifyContent: 'flex-start', color: 'text.primary', '&.active': { bgcolor: 'action.selected' } }}
    >
      {label}
    </Button>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'company' | 'admin'>('company');

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                TalentBridge
              </Typography>
              <Typography color="text.secondary">Select a user type and enter the app.</Typography>
            </Box>
            <FormControl fullWidth>
              <Select value={role} onChange={(e: SelectChangeEvent) => setRole(e.target.value as 'company' | 'admin')}>
                <MenuItem value="company">Company User</MenuItem>
                <MenuItem value="admin">Admin User</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                login(role);
                navigate(role === 'admin' ? '/admin' : '/company');
              }}
            >
              Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

function CompanyDashboard() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<RequirementSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await apiClient.getRequirements(COMPANY_ID);
        setRequirements(response.data);
      } catch (err) {
        setError('Failed to load requirements');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Company Dashboard
          </Typography>
          <Typography color="text.secondary">Track requirements and start a new intake.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/company/intake')}>
          New Requirement
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {requirements.length}
            </Typography>
            <Typography color="text.secondary">Requirements</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {requirements.reduce((sum, item) => sum + item.roleCount, 0)}
            </Typography>
            <Typography color="text.secondary">Roles</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {requirements.filter(item => item.status === 'approved').length}
            </Typography>
            <Typography color="text.secondary">Approved</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Stack spacing={2}>
        {requirements.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No requirements yet
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Use New Requirement to start an intake, generate a JD, and sync it to the admin view.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          requirements.map(item => (
            <Card key={item.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.companyName}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.driveType === 'single_role' ? 'Single role' : 'Hiring drive'} - Submitted {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button variant="outlined" onClick={() => navigate(`/company/requirements/${item.id}`)}>
                    View Details
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label={item.status.replace(/_/g, ' ')} />
                  <Chip label={`${item.roleCount} roles`} />
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}

function IntakeFlow() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'ai', text: 'Is this a single role requirement or a hiring drive with multiple roles?' }]);
  const [driveType, setDriveType] = useState<'single role' | 'hiring drive' | null>(null);
  const [roleTitle, setRoleTitle] = useState('Frontend Engineer');
  const [positions, setPositions] = useState(1);
  const [summary, setSummary] = useState('');
  const [generatedJd, setGeneratedJd] = useState<StructuredJdResponse | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addMessage = (text: string, from: 'ai' | 'user' = 'user') => setMessages((current: ChatMessage[]) => [...current, { from, text }]);

  const askNextQuestion = async (step: string, answers: Record<string, string> = {}) => {
    setLoadingMessage(true);
    try {
      const response = await apiClient.getIntakeMessage(step, answers);
      addMessage(response.data.message, 'ai');
    } catch (requestError) {
      console.error(requestError);
      if (step === 'drive-type') {
        addMessage('Do you have a complete Job Description ready?', 'ai');
      } else if (step === 'jd-ready') {
        addMessage('Would you like to upload a PDF or paste the text directly?', 'ai');
      } else {
        addMessage('Tell me the role title and a short overview of responsibilities.', 'ai');
      }
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleDriveSelection = async (selection: 'single role' | 'hiring drive') => {
    setError(null);
    setDriveType(selection);
    addMessage(selection === 'single role' ? 'Single role' : 'Hiring drive');
    await askNextQuestion('drive-type', { driveType: selection });
  };

  const handleJdChoice = async (hasJd: boolean) => {
    addMessage(hasJd ? 'Yes, I have a JD' : 'No, help me create one');
    await askNextQuestion(hasJd ? 'jd-ready' : 'jd-missing', {
      roleTitle,
      driveType: driveType ?? '',
      positions: String(positions),
    });
  };

  const handleGenerate = async () => {
    if (!driveType) {
      setError('Choose the drive type before generating the JD.');
      return;
    }
    if (!roleTitle.trim()) {
      setError('Add a role title before generating the JD.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.generateJD([
        `Drive type: ${driveType}`,
        `Role title: ${roleTitle.trim()}`,
        `Positions: ${positions}`,
        summary.trim() || 'No additional intake notes were provided.',
      ]);
      setGeneratedJd(response.data);
      setSuccess('Structured JD generated. Save it to sync the company and admin dashboards.');
      addMessage('Structured JD generated successfully.', 'ai');
    } catch (requestError) {
      setError('Failed to generate structured JD');
      console.error(requestError);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateRequirement = async () => {
    if (!generatedJd || !driveType) {
      setError('Generate the JD before creating the requirement.');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiClient.createRequirement({
        companyId: COMPANY_ID,
        driveType: driveType === 'single role' ? 'single_role' : 'hiring_drive',
        roles: [
          {
            roleTitle: roleTitle.trim() || 'Generated Role',
            positionCount: positions,
            aboutCompany: generatedJd.aboutCompany,
            aboutRole: generatedJd.aboutRole,
            requiredSkills: generatedJd.requiredSkills,
            experience: generatedJd.experienceRequired,
            compensation: generatedJd.compensationAndBenefits,
            workingHours: generatedJd.workingHoursAndTimings,
            location: generatedJd.location,
            adminInternalNotes: summary.trim() || 'Generated from AI intake.',
          },
        ],
      });

      setSuccess('Requirement created and synced to the dashboards.');
      addMessage(`Requirement ${response.data.id} saved successfully.`, 'ai');
      navigate(`/company/requirements/${response.data.id}`);
    } catch (requestError) {
      setError('Failed to create the requirement');
      console.error(requestError);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        AI Intake Flow
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Paper sx={{ p: 3, minHeight: 520 }}>
        <Stack spacing={2}>
          {messages.map((message: ChatMessage, index: number) => (
            <Box key={index} sx={{ alignSelf: message.from === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
              <Paper sx={{ p: 2, bgcolor: message.from === 'ai' ? 'action.hover' : 'primary.main', color: message.from === 'ai' ? 'text.primary' : 'primary.contrastText' }}>
                {message.text}
              </Paper>
            </Box>
          ))}
          {!driveType && (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => { void handleDriveSelection('single role'); }}>
                Single Role
              </Button>
              <Button variant="outlined" onClick={() => { void handleDriveSelection('hiring drive'); }}>
                Hiring Drive
              </Button>
            </Stack>
          )}
          {driveType && (
            <Stack spacing={2}>
              <TextField
                label="Role title"
                value={roleTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRoleTitle(e.target.value)}
                fullWidth
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => { void handleJdChoice(true); }}>
                  Yes, I have a JD
                </Button>
                <Button variant="outlined" onClick={() => { void handleJdChoice(false); }}>
                  No, help me create one
                </Button>
              </Stack>
              <TextField multiline minRows={4} fullWidth label="Paste JD text or conversational answers" value={summary} onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSummary(e.target.value)} />
              <TextField type="number" label="Positions" value={positions} onChange={(e: ChangeEvent<HTMLInputElement>) => setPositions(Number(e.target.value) || 1)} sx={{ width: 180 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" onClick={handleGenerate} disabled={generating || loadingMessage}>
                  {generating ? 'Generating...' : 'Generate Structured JD'}
                </Button>
                <Button variant="outlined" onClick={handleCreateRequirement} disabled={!generatedJd || creating}>
                  {creating ? 'Saving...' : 'Create Requirement'}
                </Button>
              </Stack>
              {generatedJd && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                      Structured JD Preview
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2">About the Company</Typography>
                        <Typography color="text.secondary">{generatedJd.aboutCompany}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">About the Role</Typography>
                        <Typography color="text.secondary">{generatedJd.aboutRole}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Required Skills</Typography>
                        <Typography color="text.secondary">{generatedJd.requiredSkills}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Experience Required</Typography>
                        <Typography color="text.secondary">{generatedJd.experienceRequired}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Compensation and Benefits</Typography>
                        <Typography color="text.secondary">{generatedJd.compensationAndBenefits}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Working Hours and Timings</Typography>
                        <Typography color="text.secondary">{generatedJd.workingHoursAndTimings}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Location</Typography>
                        <Typography color="text.secondary">{generatedJd.location}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function RequirementDetail() {
  const { id } = useParams();
  const [requirement, setRequirement] = useState<RequirementDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchRequirement = async () => {
      try {
        const response = await apiClient.getRequirement(id);
        setRequirement(response.data);
      } catch (requestError) {
        setError('Failed to load requirement details');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [id]);

  const handleConfirmPartial = async () => {
    if (!id) {
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.confirmPartialApproval(id);
      setRequirement(response.data);
    } catch (requestError) {
      setError('Failed to confirm partial approval');
      console.error(requestError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  if (!requirement) {
    return <Alert severity="info">Requirement not found.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Requirement Details
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography color="text.secondary">Company</Typography>
              <Typography variant="h6">{requirement.companyName}</Typography>
            </Box>
            <Box>
              <Typography color="text.secondary">Requirement ID</Typography>
              <Typography variant="body1">{requirement.id}</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={requirement.driveType === 'single_role' ? 'Single role' : 'Hiring drive'} />
              <Chip label={requirement.status.replace(/_/g, ' ')} />
              <Chip label={requirement.partialApprovalConfirmed ? 'Partial approval confirmed' : 'Partial approval pending'} />
            </Stack>
            {requirement.status === 'partially_approved' && !requirement.partialApprovalConfirmed && (
              <Button variant="contained" onClick={handleConfirmPartial} disabled={saving} sx={{ width: 'fit-content' }}>
                {saving ? 'Confirming...' : 'Confirm Partial Approval'}
              </Button>
            )}
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Roles
            </Typography>
            {requirement.roles.length === 0 ? (
              <Typography color="text.secondary">No roles attached to this requirement.</Typography>
            ) : (
              requirement.roles.map(role => (
                <Card key={role.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {role.roleTitle}
                          </Typography>
                          <Typography color="text.secondary">{role.positionCount} positions</Typography>
                        </Box>
                        <Chip label={role.status.replace(/_/g, ' ')} />
                      </Stack>
                      <Typography color="text.secondary">About the Role: {role.aboutRole || 'Not provided'}</Typography>
                      <Typography color="text.secondary">Skills: {role.requiredSkills || 'Not provided'}</Typography>
                      <Typography color="text.secondary">Experience: {role.experience || 'Not provided'}</Typography>
                      <Typography color="text.secondary">Location: {role.location || 'Not provided'}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Candidates
            </Typography>
            {requirement.candidates.length === 0 ? (
              <Typography color="text.secondary">No candidates have been added yet.</Typography>
            ) : (
              requirement.candidates.map(candidate => (
                <Card key={candidate.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {candidate.fullName}
                        </Typography>
                        <Typography color="text.secondary">{candidate.email}</Typography>
                      </Box>
                      <Chip label={candidate.stage.replace(/_/g, ' ')} />
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyRequirementsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiClient.getAllRequirementsAdmin();
        setCompanies(response.data);
      } catch (requestError) {
        setError('Failed to load admin dashboard data');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const allRequirements = companies.flatMap(company => company.requirements);
  const approvedCount = allRequirements.filter(requirement => requirement.status === 'approved').length;
  const pendingCount = allRequirements.filter(requirement => requirement.status === 'pending_review').length;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Admin Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Overview
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ flex: 1 }} variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{companies.length}</Typography>
                  <Typography color="text.secondary">Companies</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }} variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{allRequirements.length}</Typography>
                  <Typography color="text.secondary">Requirements</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }} variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{approvedCount}</Typography>
                  <Typography color="text.secondary">Approved</Typography>
                </CardContent>
              </Card>
            </Stack>
            <Typography color="text.secondary">Pending review: {pendingCount}</Typography>
            <Button variant="outlined" onClick={() => navigate('/admin/requirements')} sx={{ width: 'fit-content' }}>
              Review Requirements
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {companies.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No companies available
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                New intakes will appear here once company users create requirements.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          companies.map(company => (
            <Card key={company.companyId}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {company.companyName}
                </Typography>
                <Typography color="text.secondary">{company.requirements.length} requirements</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {company.requirements.map(requirement => (
                    <Card key={requirement.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{requirement.driveType === 'single_role' ? 'Single role' : 'Hiring drive'}</Typography>
                            <Typography color="text.secondary">{requirement.roleCount} roles - {requirement.status.replace(/_/g, ' ')}</Typography>
                          </Box>
                          <Button variant="text" onClick={() => navigate(`/company/requirements/${requirement.id}`)}>
                            Open
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}

function AdminRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await apiClient.getAllRequirementsAdmin();
        const flattened = response.data.flatMap((companyResp: any) => companyResp.requirements);
        setRequirements(flattened);
      } catch (err) {
        setError('Failed to load requirements');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateRequirementStatus(id, newStatus);
      setRequirements(requirements.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Requirements Review
      </Typography>
      {requirements.length === 0 ? (
        <Typography color="text.secondary">No requirements to review.</Typography>
      ) : (
        requirements.map(item => (
          <Card key={item.id}>
            <CardContent>
              <Typography variant="h6">{item.roles?.[0]?.roleTitle || 'Requirement'}</Typography>
              <Typography color="text.secondary">{item.driveType} â€¢ {item.status}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant={item.status === 'approved' ? 'contained' : 'outlined'} onClick={() => handleStatusUpdate(item.id, 'approved')}>
                  Approve
                </Button>
                <Button variant={item.status === 'partially_approved' ? 'contained' : 'outlined'} onClick={() => handleStatusUpdate(item.id, 'partially_approved')}>
                  Hold
                </Button>
                <Button color="error" variant={item.status === 'rejected' ? 'contained' : 'outlined'} onClick={() => handleStatusUpdate(item.id, 'rejected')}>
                  Reject
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
}

function PipelineManagement() {
  const { roleId } = useParams<{ roleId: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stages = ['Applied', 'Screened', 'Interviewing', 'Offered', 'Hired', 'Rejected'];

  useEffect(() => {
    if (!roleId) return;
    const fetchCandidates = async () => {
      try {
        const response = await apiClient.getCandidatesByRole(roleId);
        setCandidates(response.data);
      } catch (err) {
        setError('Failed to load candidates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [roleId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Candidate Pipeline
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Role overview and stage conversion metrics</Typography>
          <Stepper activeStep={1} alternativeLabel sx={{ mt: 2 }}>
            {stages.map(stage => (
              <Step key={stage}>
                <StepLabel>{stage}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Stack spacing={2} sx={{ mt: 3 }}>
            {candidates.length === 0 ? (
              <Typography color="text.secondary">No candidates yet for this role.</Typography>
            ) : (
              candidates.map(candidate => (
                <Paper key={candidate.id} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{candidate.fullName}</Typography>
                  <Typography color="text.secondary">{candidate.stage} â€¢ Updated {new Date(candidate.updatedAt).toLocaleDateString()}</Typography>
                </Paper>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function LlmSettings() {
  const [provider, setProvider] = useState('openai');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.getLlmSettings();
        setProvider(response.data.activeProvider);
      } catch (err) {
        setError('Failed to load LLM settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateLlmSettings(provider as 'openai' | 'gemini' | 'claude');
      alert('LLM provider updated successfully');
    } catch (err) {
      setError('Failed to update LLM provider');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        LLM Settings
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Card>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Gemini is the only provider currently wired for dependable free-tier usage in this deployment. OpenAI and Claude are kept for compatibility, but they may require non-free tiers or external paid API access.
          </Alert>
          <Typography color="text.secondary">Switch the active provider without redeploying.</Typography>
          <FormControl sx={{ mt: 2, minWidth: 240 }}>
            <Select value={provider} onChange={(e: SelectChangeEvent) => setProvider(e.target.value)}>
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="gemini">Gemini</MenuItem>
              <MenuItem value="claude">Claude</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" sx={{ ml: 2, mt: 2 }} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Provider'}
          </Button>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default App;

