import React, { useState, useEffect } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton
} from "@mui/material";
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  KeyRound, 
  ArrowLeft, 
  ExternalLink, 
  UserCheck, 
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Shield,
  Truck,
  Store,
  Compass
} from "lucide-react";
import { UserRole } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: UserRole }) => void;
  initialResetToken?: string | null;
  initialResetEmail?: string | null;
}

export default function LoginScreen({ onLoginSuccess, initialResetToken, initialResetEmail }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery views state
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(
    initialResetToken && initialResetEmail ? "reset" : "login"
  );

  // Password reset fields
  const [resetEmail, setResetEmail] = useState(initialResetEmail || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [smtpPreviewUrl, setSmtpPreviewUrl] = useState<string | null>(null);

  // Sample credentials
  const credentials = [
    { email: "guest@electromart.com", password: "guestpassword", role: "Guest" as UserRole, desc: "Browse items safely", icon: Compass, color: "text-slate-500 border-slate-100 bg-slate-50" },
    { email: "tonystark074310@gmail.com", password: "tony123", role: "Customer" as UserRole, desc: "Real sandbox email!", icon: User, color: "text-indigo-600 border-indigo-100 bg-indigo-50/50" },
    { email: "customer@electromart.com", password: "customer123", role: "Customer" as UserRole, desc: "Purchase goods & tracking", icon: User, color: "text-blue-600 border-blue-100 bg-blue-50/50" },
    { email: "seller@electromart.com", password: "seller123", role: "Seller" as UserRole, desc: "List stock in Seller Studio", icon: Store, color: "text-amber-600 border-amber-100 bg-amber-50/50" },
    { email: "delivery@electromart.com", password: "delivery123", role: "DeliveryAgent" as UserRole, desc: "Status & coordinates logs", icon: Truck, color: "text-emerald-600 border-emerald-100 bg-emerald-50/50" },
    { email: "admin@electromart.com", password: "admin123", role: "Admin" as UserRole, desc: "Moderate orders & coupons", icon: Shield, color: "text-purple-600 border-purple-100 bg-purple-50/50" },
    { email: "superadmin@electromart.com", password: "super123", role: "SuperAdmin" as UserRole, desc: "Universal root access levels", icon: KeyRound, color: "text-rose-600 border-rose-100 bg-rose-50/50" }
  ];

  const handleFillCredentials = (cred: typeof credentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
    setSuccess(`Loaded test settings for: ${cred.role}!`);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password credentials");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Wrong authentication credentials received.");
      }

      setSuccess(`Authentication validated! Welcome back ${data.name}.`);
      setTimeout(() => {
        onLoginSuccess({
          email: data.email,
          name: data.name,
          role: data.role as UserRole
        });
      }, 800);

    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please provide a valid account email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setSmtpPreviewUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Password release dispatch failure.");
      }

      setSuccess("SMTP email dispatch triggered successfully! Check your inbox.");
      if (data.info && data.info.previewUrl) {
        setSmtpPreviewUrl(data.info.previewUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed dispatching recovery password query.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please key in both password entry fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Review typing details.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, password: newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed resetting system password.");
      }

      setSuccess("Your password was updated! Redirecting to login shortly...");
      setTimeout(() => {
        setEmail(resetEmail);
        setPassword(newPassword);
        setMode("login");
        setError(null);
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Password update event exception.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="w-full flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
      <div id="login-widget" className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
        
        {/* Helper Box: Sample Credentials & Role Guide */}
        <div className="lg:col-span-5 space-y-4">
          <Paper className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <Typography variant="subtitle1" className="font-bold text-slate-800 tracking-tight">
                Developer Credentials Sandbox
              </Typography>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Below are pre-configured developer test accounts matching the application roles. 
              Clicking any card will <strong>auto-fill</strong> the login form instantly for swift manual verification.
            </p>

            <Divider className="border-slate-100" />

            <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {credentials.map((cred, idx) => {
                const IconComp = cred.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleFillCredentials(cred)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all duration-200 flex items-start gap-3 ${cred.color}`}
                  >
                    <div className="p-2 rounded-xl bg-white border border-slate-100/50 text-slate-700 shadow-sm shrink-0">
                      <IconComp className="w-4 h-4 text-inherit" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">{cred.role} Account</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200/60 text-slate-600 font-semibold">{cred.password}</span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-500 break-all">{cred.email}</p>
                      <p className="text-[10px] text-slate-400 font-sans italic">{cred.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Paper>

          {/* Quick Info */}
          <Paper className="p-4 rounded-2xl border border-slate-100 bg-indigo-50/50 text-indigo-950 flex gap-3 text-xs leading-relaxed">
            <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Testing real SMTP custom integrations?</span>
              Add your own <code className="font-mono bg-indigo-100/60 px-1 rounded text-[11px]">SMTP_HOST</code> parameters in secrets. If left blank, the server spins up a test SMTP client sandbox via <strong>Ethereal Mail</strong> with instant viewing links.
            </div>
          </Paper>
        </div>

        {/* Input Interface Card */}
        <div className="lg:col-span-7">
          <Paper className="p-8 rounded-3xl border border-slate-100 bg-white shadow-md relative overflow-hidden transition-all duration-300">
            {/* Logo area */}
            <div className="text-center space-y-2 mb-8">
              <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-indigo-100/30">
                ⚡
              </div>
              <Typography variant="h5" className="font-extrabold text-slate-900 tracking-tight">
                ElectroMart Secure Hub
              </Typography>
              <p className="text-xs text-slate-400">
                Provide valid credentials to connect, sell, track, or moderate systems.
              </p>
            </div>

            {/* Alert Logs */}
            {error && (
              <Alert severity="error" className="mb-5 rounded-2xl text-xs font-semibold border border-rose-100 bg-rose-50/20">
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" className="mb-5 rounded-2xl text-xs font-semibold border border-green-100 bg-green-50/20">
                {success}
              </Alert>
            )}

            {/* LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Credential Email</label>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Enter email address (e.g., customer@electromart.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                        className: "rounded-xl font-sans"
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                    <button 
                      type="button"
                      onClick={() => { setResetEmail(email); setMode("forgot"); setError(null); setSuccess(null); }}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    placeholder="Enter password code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        className: "rounded-xl font-sans"
                      }
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  variant="contained"
                  className="bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl font-bold font-sans text-sm tracking-tight text-white normal-case shadow-md shadow-indigo-600/20"
                >
                  {loading ? <CircularProgress size={20} className="text-white" /> : "Authenticate Secure login"}
                </Button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === "forgot" && (
              <div className="space-y-5">
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs cursor-pointer hover:underline mb-2" onClick={() => { setMode("login"); setError(null); setSmtpPreviewUrl(null); }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to log in page
                </div>

                <Typography variant="body1" className="font-bold text-slate-800 text-left text-sm">
                  Retrieve Account Access via SMTP
                </Typography>
                <p className="text-[11px] text-slate-500 text-left leading-relaxed">
                  Provide your registered tester or custom email address below. We'll send an authentication reset key directly to your inbox through nodemailer server SMTP layers.
                </p>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Registered Email</label>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="e.g. tonystark074310@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail className="w-4 h-4 text-slate-400" />
                            </InputAdornment>
                          ),
                          className: "rounded-xl font-sans"
                        }
                      }}
                    />
                  </div>

                  {smtpPreviewUrl && (
                    <Paper className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/70 text-left space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                        <KeyRound className="w-4 h-4 shrink-0" />
                        SMTP Test Simulation Active
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Nodemailer was directed through an <strong>Ethereal Sandbox server</strong>. Since it is a dummy email target, click the secure link below to open the dynamic mailbox and retrieve the recovery URL!
                      </p>
                      <Button
                        size="small"
                        variant="outlined"
                        component="a"
                        href={smtpPreviewUrl}
                        target="_blank"
                        rel="referrer"
                        endIcon={<ExternalLink className="w-3 h-3" />}
                        className="rounded-lg normal-case text-[10px] py-1 font-bold bg-white text-indigo-700 border-indigo-200 hover:bg-slate-50"
                      >
                        Inspect Ethereal Reset Inbox
                      </Button>
                    </Paper>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    variant="contained"
                    className="bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl font-bold font-sans text-sm tracking-tight text-white normal-case shadow-md"
                  >
                    {loading ? <CircularProgress size={20} className="text-white" /> : "Deploy SMTP Recovery Email"}
                  </Button>
                </form>
              </div>
            )}

            {/* RESET PASSWORD FORM */}
            {mode === "reset" && (
              <div className="space-y-4">
                <Typography variant="body1" className="font-bold text-slate-800 text-left text-sm">
                  Write a fresh Account Password Code
                </Typography>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-left">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block font-mono">Verified reset instance token</span>
                  <div className="font-bold text-xs text-slate-700 break-all">{resetEmail}</div>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">New Secure Password</label>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      variant="outlined"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock className="w-4 h-4 text-slate-400" />
                            </InputAdornment>
                          ),
                          className: "rounded-xl font-sans"
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock className="w-4 h-4 text-slate-400" />
                            </InputAdornment>
                          ),
                          className: "rounded-xl font-sans"
                        }
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading}
                    variant="contained"
                    className="bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl font-bold font-sans text-sm tracking-tight text-white normal-case shadow-md"
                  >
                    {loading ? <CircularProgress size={20} /> : "Finalize Password Setup"}
                  </Button>
                </form>
              </div>
            )}
          </Paper>
        </div>
      </div>
    </Box>
  );
}
