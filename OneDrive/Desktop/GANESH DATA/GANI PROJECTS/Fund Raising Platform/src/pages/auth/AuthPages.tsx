import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Heart, Lock, Mail, User, Phone, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast("Welcome back. You are now signed in.");
      navigate("/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to sign in. Please check your details.", "error");
    } finally { setLoading(false); }
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue your fundraising journey.">
    <form onSubmit={submit} className="space-y-5">
      <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required leftIcon={<Mail className="w-4 h-4" />} />
      <Input label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required leftIcon={<Lock className="w-4 h-4" />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link></div>
      <Button type="submit" fullWidth loading={loading}>Sign In</Button>
    </form>
    <p className="mt-6 text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="font-semibold text-primary-600">Create one</Link></p>
  </AuthShell>;
}

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password.length < 8) { toast("Password must be at least 8 characters.", "error"); return; }
    if (form.password !== form.confirm) { toast("Passwords do not match.", "error"); return; }
    setLoading(true);
    try {
      await signUp(form.name, form.email, form.password, form.phone);
      toast("Your account was created. Welcome to NayePankh!");
      navigate("/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to create your account.", "error");
    } finally { setLoading(false); }
  };

  return <AuthShell title="Start making an impact" subtitle="Create an account and receive your personal fundraising link.">
    <form onSubmit={submit} className="space-y-4">
      <Input label="Full name" value={form.name} onChange={update("name")} placeholder="Your full name" required leftIcon={<User className="w-4 h-4" />} />
      <Input label="Email address" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" required leftIcon={<Mail className="w-4 h-4" />} />
      <Input label="Phone number" type="tel" value={form.phone} onChange={update("phone")} placeholder="+91 98765 43210" leftIcon={<Phone className="w-4 h-4" />} />
      <Input label="Password" type="password" value={form.password} onChange={update("password")} placeholder="At least 8 characters" required leftIcon={<Lock className="w-4 h-4" />} />
      <Input label="Confirm password" type="password" value={form.confirm} onChange={update("confirm")} placeholder="Repeat your password" required leftIcon={<Lock className="w-4 h-4" />} />
      <Button type="submit" fullWidth loading={loading} leftIcon={<Heart className="w-4 h-4" />}>Create Account</Button>
    </form>
    <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="font-semibold text-primary-600">Sign in</Link></p>
  </AuthShell>;
}

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast(error.message, "error"); else { setSent(true); toast("If an account exists, password reset instructions are on the way."); }
  };
  return <AuthShell title="Reset your password" subtitle={sent ? "Check your inbox for reset instructions." : "Enter your email and we will send you a secure reset link."}>
    {!sent && <form onSubmit={submit} className="space-y-5"><Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required leftIcon={<Mail className="w-4 h-4" />} /><Button type="submit" fullWidth>Send Reset Link</Button></form>}
    <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-600"><ArrowLeft className="w-4 h-4" /> Back to sign in</Link>
  </AuthShell>;
}

export function ResetPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8 || password !== confirm) { toast("Use 8 or more matching characters.", "error"); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast(error.message, "error"); else { toast("Your password has been updated."); navigate("/login"); }
  };
  return <AuthShell title="Choose a new password" subtitle="Create a new password for your account."><form onSubmit={submit} className="space-y-5"><Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required leftIcon={<Lock className="w-4 h-4" />} /><Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required leftIcon={<Lock className="w-4 h-4" />} /><Button type="submit" fullWidth>Update Password</Button></form></AuthShell>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-12"><div className="w-full max-w-md"><div className="flex justify-center mb-8"><Logo size="lg" to="/" /></div><Card padding="lg"><h1 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100 text-center">{title}</h1><p className="mt-2 text-sm text-gray-500 text-center">{subtitle}</p><div className="mt-8">{children}</div></Card><p className="mt-6 text-center text-xs text-gray-400">By continuing, you agree to our <Link to="/terms" className="text-primary-600">Terms</Link> and <Link to="/privacy" className="text-primary-600">Privacy Policy</Link>.</p></div></div>;
}
