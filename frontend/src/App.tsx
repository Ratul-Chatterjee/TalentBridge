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
import type { Requirement, Candidate, Role, LlmSettings } from './api';

type ChatMessage = {
  from: 'ai' | 'user';
  text: string;
};

const formatStatus = (value: string) => value.replace(/_/g, ' ');

function App({ mode, onToggleMode }: { mode: 'light' | 'dark'; onToggleMode: () => void }) {
  const { userType } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (!userType) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={userType === 'admin' ? '/admin' : '/company'} replace />} />
      <Route element={<AppShell mode={mode} onToggleMode={onToggleMode} onLogout={() => { localStorage.removeItem('tb-user-type'); navigate('/login'); }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}>
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
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await apiClient.getRequirements();
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
      <Stack spacing={2}>
        {requirements.length === 0 ? (
          <Typography color="text.secondary">No requirements yet. Create one to get started.</Typography>
        ) : (
          requirements.map(item => (
            <Card key={item.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.roles?.[0]?.roleTitle || 'Requirement'}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.driveType} • Submitted {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button variant="outlined" onClick={() => navigate(`/company/requirements/${item.id}`)}>
                    View Details
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label={formatStatus(item.status)} />
                  <Chip label={`${item.roles?.length || 0} roles`} />
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
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'ai', text: 'Is this a single role requirement or a hiring drive with multiple roles?' }]);
  const [driveType, setDriveType] = useState<string | null>(null);
  const [positions, setPositions] = useState(1);
  const [summary, setSummary] = useState('');

  const addMessage = (text: string, from: 'ai' | 'user' = 'user') => setMessages((current: ChatMessage[]) => [...current, { from, text }]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        AI Intake Flow
      </Typography>
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
              <Button variant="contained" onClick={() => { setDriveType('single role'); addMessage('Single role'); addMessage('Do you have a complete Job Description ready?', 'ai'); }}>
                Single role
              </Button>
              <Button variant="outlined" onClick={() => { setDriveType('hiring drive'); addMessage('Hiring drive'); addMessage('Do you have a complete Job Description ready?', 'ai'); }}>
                Hiring drive
              </Button>
            </Stack>
          )}
          {driveType && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => addMessage('Yes, I have a JD')}>Yes, I have a JD</Button>
                <Button variant="outlined" onClick={() => addMessage('No, help me create one')}>No, help me create one</Button>
              </Stack>
              <TextField multiline minRows={4} fullWidth label="Paste JD text or conversational answers" value={summary} onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSummary(e.target.value)} />
              <TextField type="number" label="Positions" value={positions} onChange={(e: ChangeEvent<HTMLInputElement>) => setPositions(Number(e.target.value) || 1)} sx={{ width: 180 }} />
              <Button variant="contained">Generate Structured JD</Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function RequirementDetail() {
  const { id } = useParams();
  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Requirement Details
      </Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">Requirement ID</Typography>
          <Typography variant="h6">{id}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Partial approval confirmation placeholder</Typography>
          <Typography color="text.secondary">
            If some roles are approved and some are not, the company confirmation prompt appears here.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

function AdminDashboard() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        Admin Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">All incoming requirements grouped by company</Typography>
          <Typography color="text.secondary">This page will expand into the grouped review experience.</Typography>
        </CardContent>
      </Card>
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
        const response = await apiClient.getRequirements();
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
              <Typography color="text.secondary">{formatStatus(item.driveType)} • {formatStatus(item.status)}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant={item.status === 'approved' ? 'contained' : 'outlined'} onClick={() => handleStatusUpdate(item.id, 'approved')}>
                  Approve
                </Button>
                <Button variant={item.status === 'partially_approved' ? 'contained' : 'outlined'} onClick={() => handleStatusUpdate(item.id, 'partially_approved')}>
                  Mark Partially Approved
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
                  <Typography color="text.secondary">{candidate.currentStage} • Updated {new Date(candidate.updatedAt).toLocaleDateString()}</Typography>
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
