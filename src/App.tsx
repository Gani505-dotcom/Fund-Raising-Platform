import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PublicLayout from "@/components/layout/PublicLayout";
import LandingPage from "@/pages/public/LandingPage";
import CampaignsPage from "@/pages/public/CampaignsPage";
import CampaignDetailsPage from "@/pages/public/CampaignDetailsPage";
import { AboutPage, ContactPage, FAQPage, PolicyPage } from "@/pages/public/InfoPages";
import DonatePage, { DonationFailurePage, DonationSuccessPage } from "@/pages/public/DonatePages";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "@/pages/auth/AuthPages";
import { DashboardPage, NotificationsPage, ProfilePage, ReferralPage, SettingsPage, TransactionsPage } from "@/pages/user/UserPages";
import { AdminDashboardPage, AdminPlaceholderPage } from "@/pages/admin/AdminPages";

function RequireAuth() { const { session, loading } = useAuth(); if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your account...</div>; return session ? <Outlet /> : <Navigate to="/login" replace />; }
function RequireAdmin() { const { profile, loading } = useAuth(); if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your account...</div>; return profile?.role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />; }
function Public() { return <PublicLayout><Outlet /></PublicLayout>; }

export default function App() { return <ThemeProvider><ToastProvider><AuthProvider><BrowserRouter><Routes><Route element={<Public />}><Route path="/" element={<LandingPage />} /><Route path="/about" element={<AboutPage />} /><Route path="/campaigns" element={<CampaignsPage />} /><Route path="/campaigns/:slug" element={<CampaignDetailsPage />} /><Route path="/donate" element={<DonatePage />} /><Route path="/donation-success" element={<DonationSuccessPage />} /><Route path="/donation-failure" element={<DonationFailurePage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/faq" element={<FAQPage />} /><Route path="/privacy" element={<PolicyPage />} /><Route path="/terms" element={<PolicyPage terms />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ResetPasswordPage />} /></Route><Route element={<RequireAuth />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/transactions" element={<TransactionsPage />} /><Route path="/referrals" element={<ReferralPage />} /><Route path="/notifications" element={<NotificationsPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/settings" element={<SettingsPage />} /></Route><Route element={<RequireAdmin />}><Route path="/admin" element={<AdminDashboardPage />} /><Route path="/admin/users" element={<AdminPlaceholderPage title="User Management" />} /><Route path="/admin/donations" element={<AdminPlaceholderPage title="Donation Management" />} /><Route path="/admin/campaigns" element={<AdminPlaceholderPage title="Campaign Management" />} /><Route path="/admin/reports" element={<AdminPlaceholderPage title="Reports" />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></AuthProvider></ToastProvider></ThemeProvider>; }
