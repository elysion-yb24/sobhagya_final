"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserDetails,
  getAuthToken,
  isAuthenticated,
  fetchUserProfile,
  maskPhone,
} from "../utils/auth-utils";
import { fetchWalletBalance as simpleFetchWalletBalance } from "../utils/production-api";
import { User, Phone, Mail, Edit3, Save, X, ArrowLeft, ChevronRight, Wallet, Star, PhoneCall, History } from "lucide-react";
import Link from "next/link";

export default function MyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);


  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    aboutUs: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const freshProfile = await fetchUserProfile();
        if (freshProfile) {
          setProfile(freshProfile);
          populateForm(freshProfile);
        } else {
          const cached = getUserDetails();
          if (cached) {
            setProfile(cached);
            populateForm(cached);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        const cached = getUserDetails();
        if (cached) {
          setProfile(cached);
          populateForm(cached);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Fetch wallet balance
    simpleFetchWalletBalance().then(b => setWalletBalance(b)).catch(() => setWalletBalance(0));
  }, [mounted, router]);

  const populateForm = (data: any) => {
    const aboutData = data.aboutUs || data.about;
    setEditForm({
      name: data.name || data.displayName || "",
      aboutUs: aboutData || "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    const payload: any = {};
    if (editForm.name.trim()) payload.name = editForm.name.trim();
    if (editForm.aboutUs.trim()) payload.aboutUs = editForm.aboutUs.trim();

    try {
      const token = getAuthToken();
      if (!token) {
        setSaveMessage({ type: "error", text: "Not authenticated. Please log in again." });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSaveMessage({ type: "success", text: "Profile updated successfully!" });
        const cached = getUserDetails();
        if (cached) {
          const updated = { ...cached, ...payload, updatedAt: Date.now() };
          if (payload.name) {
            const parts = payload.name.split(" ");
            updated.firstName = parts[0];
            updated.lastName = parts.slice(1).join(" ");
            updated.displayName = payload.name;
            updated.profileCompleted = true;
          }
          localStorage.setItem("userDetails", JSON.stringify(updated));
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("user-auth-changed"));
          }
        }
        const refreshed = await fetchUserProfile();
        if (refreshed) {
          setProfile(refreshed);
          populateForm(refreshed);
        }
        setTimeout(() => setIsEditing(false), 1200);
      } else {
        setSaveMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    if (profile) populateForm(profile);
    setIsEditing(false);
    setSaveMessage(null);
  };

  const getInitial = () => {
    const name = profile?.name || profile?.displayName || "U";
    return name.charAt(0).toUpperCase();
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen w-full bg-[#0f0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-200/60 text-sm">Loading your cosmic profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-[#0f0a1a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Unable to load profile. Please log in again.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.name || profile.displayName || "User";
  const phone = maskPhone(profile.phoneNumber || profile.phone) || "";
  const email = profile.email || "";
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#fef9f0] via-white to-[#fff7ed] relative overflow-hidden">
      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#1a0a2e] via-[#2d1654] to-[#1a0e2e] overflow-hidden">
        {/* Zodiac pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-300 rounded-full" style={{ animation: 'profile-spin 90s linear infinite' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] border border-orange-400 rounded-full" style={{ animation: 'profile-spin 60s linear infinite reverse' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border border-amber-200 rounded-full" style={{ animation: 'profile-spin 35s linear infinite' }}></div>
        </div>
        {/* Golden glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-1 shadow-2xl shadow-orange-500/20">
                <div className="w-full h-full rounded-full bg-[#1a0a2e] flex items-center justify-center overflow-hidden">
                  {profile.avatar || profile.profileImage ? (
                    <img
                      src={profile.avatar || profile.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-amber-300 to-orange-400 bg-clip-text text-transparent">
                      {getInitial()}
                    </span>
                  )}
                </div>
              </div>
              {/* Status dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-400 border-[3px] border-[#1a0a2e] shadow-lg"></div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{displayName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2">
                {phone && (
                  <span className="flex items-center gap-1.5 text-amber-200/70 text-sm">
                    <Phone className="w-3.5 h-3.5" /> {phone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-1.5 text-amber-200/70 text-sm min-w-0 max-w-full">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate break-anywhere">{email}</span>
                  </span>
                )}
              </div>
              {memberSince && (
                <p className="text-white/30 text-xs mt-2">Member since {memberSince}</p>
              )}
            </div>

            {/* Edit button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards — overlap banner */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 text-center hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{walletBalance?.toFixed(0) || '0'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Wallet Balance</p>
          </div>
          <Link href="/history/call-history" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 text-center hover:shadow-xl transition-shadow group">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
              <PhoneCall className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{profile.totalCalls || '0'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Calls</p>
          </Link>
          <Link href="/history/Transaction-history" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 text-center hover:shadow-xl transition-shadow group">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-100 transition-colors">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{profile.totalTransactions || '0'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Transactions</p>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-6 pb-12">
        {/* Save Message */}
        {saveMessage && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              saveMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {isEditing ? (
          /* ---- EDIT MODE ---- */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
              <h2 className="text-lg font-bold text-gray-900">Edit Your Profile</h2>
              <p className="text-sm text-gray-500 mt-0.5">Update your personal and astrological details</p>
            </div>
            <div className="px-6 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                />
              </div>
              {/* About */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">About</label>
                <textarea
                  value={editForm.aboutUs}
                  onChange={(e) => setEditForm({ ...editForm, aboutUs: e.target.value })}
                  placeholder="Tell us something about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ---- VIEW MODE ---- */
          <div className="space-y-4">
            {/* Profile Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                <ProfileRow icon={<User className="w-5 h-5" />} label="Name" value={displayName} color="orange" />
                <ProfileRow icon={<Phone className="w-5 h-5" />} label="Phone" value={phone || "Not set"} color="blue" />
                {email && <ProfileRow icon={<Mail className="w-5 h-5" />} label="Email" value={email} color="purple" />}
              </div>
              {(profile.aboutUs || profile.about) && (
                <div className="px-5 py-6 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">About Me</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.aboutUs || profile.about}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-700">Quick Actions</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <Link href="/call-with-astrologer" className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50/40 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <PhoneCall className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Talk to Astrologer</p>
                    <p className="text-xs text-gray-400">Get expert guidance now</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
                <Link href="/history/call-history" className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/40 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <History className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Call History</p>
                    <p className="text-xs text-gray-400">View your past consultations</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
                <Link href="/history/Transaction-history" className="flex items-center gap-4 px-5 py-4 hover:bg-green-50/40 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Transaction History</p>
                    <p className="text-xs text-gray-400">Payments & recharges</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes profile-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  color = "orange",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  const isNotSet = value === "Not set";
  const bgColors: Record<string, string> = {
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    green: "bg-green-50 text-green-500",
    pink: "bg-pink-50 text-pink-500",
    indigo: "bg-indigo-50 text-indigo-500",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-500",
  };
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColors[color] || bgColors.orange}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 truncate ${isNotSet ? "text-gray-300 italic font-normal" : "text-gray-800"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
