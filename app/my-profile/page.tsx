"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserDetails,
  getAuthToken,
  isAuthenticated,
  fetchUserProfile,
} from "../utils/auth-utils";
import { User, Phone, Mail, Calendar, MapPin, Clock, Edit3, Save, X, ArrowLeft, ChevronRight } from "lucide-react";

export default function MyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    topic: "",
    aboutUs: "",
    language: "",
    dob: "",
    placeOfBirth: "",
    timeOfBirth: "",
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
  }, [mounted, router]);

  const populateForm = (data: any) => {
    setEditForm({
      name: data.name || data.displayName || "",
      age: data.age?.toString() || "",
      gender: data.gender || "",
      topic: Array.isArray(data.topic) ? data.topic.join(", ") : data.topic || "",
      aboutUs: data.aboutUs || "",
      language: Array.isArray(data.language) ? data.language.join(", ") : data.language || "",
      dob: data.dob || "",
      placeOfBirth: data.placeOfBirth || "",
      timeOfBirth: data.timeOfBirth || "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    const payload: any = {};
    if (editForm.name.trim()) payload.name = editForm.name.trim();
    if (editForm.age) payload.age = parseInt(editForm.age, 10);
    if (editForm.gender) payload.gender = editForm.gender;
    if (editForm.topic.trim()) {
      payload.topic = editForm.topic.includes(",")
        ? editForm.topic.split(",").map((t) => t.trim()).filter(Boolean)
        : editForm.topic.trim();
    }
    if (editForm.aboutUs.trim()) payload.aboutUs = editForm.aboutUs.trim();
    if (editForm.language.trim()) {
      payload.language = editForm.language.includes(",")
        ? editForm.language.split(",").map((l) => l.trim()).filter(Boolean)
        : editForm.language.trim();
    }

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
        // Update local cache
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
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Unable to load profile. Please log in again.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.name || profile.displayName || "User";
  const phone = profile.phoneNumber || profile.phone || "";
  const email = profile.email || "";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-12 sm:pt-28">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-8 sm:px-8 sm:py-10 relative">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                {profile.avatar || profile.profileImage ? (
                  <img
                    src={profile.avatar || profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">{getInitial()}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{displayName}</h1>
                {phone && (
                  <p className="text-orange-100 mt-1 flex items-center gap-2 text-sm sm:text-base">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{phone}</span>
                  </p>
                )}
                {email && (
                  <p className="text-orange-100 mt-0.5 flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-white/30 transition-colors border border-white/30"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`mx-6 sm:mx-8 mt-4 px-4 py-3 rounded-xl text-sm font-medium ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Profile Body */}
          <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5">
            {isEditing ? (
              /* ---- EDIT MODE ---- */
              <div className="space-y-5">
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

                {/* Age & Gender Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="Age"
                      min={1}
                      max={120}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                  />
                </div>

                {/* Place & Time of Birth Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Place of Birth</label>
                    <input
                      type="text"
                      value={editForm.placeOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, placeOfBirth: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time of Birth</label>
                    <input
                      type="time"
                      value={editForm.timeOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, timeOfBirth: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                    />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language(s)</label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    placeholder="e.g. Hindi, English"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800"
                  />
                </div>

                {/* Topics of Interest */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Topics of Interest</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                    placeholder="e.g. Career, Relationship, Health"
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
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-800 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
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
            ) : (
              /* ---- VIEW MODE ---- */
              <div className="space-y-1">
                <ProfileRow icon={<User className="w-5 h-5" />} label="Name" value={displayName} />
                <ProfileRow icon={<Phone className="w-5 h-5" />} label="Phone" value={phone || "Not set"} />
                {email && <ProfileRow icon={<Mail className="w-5 h-5" />} label="Email" value={email} />}
                <ProfileRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Age"
                  value={profile.age ? `${profile.age} years` : "Not set"}
                />
                <ProfileRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  label="Gender"
                  value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "Not set"}
                />
                <ProfileRow
                  icon={<Calendar className="w-5 h-5" />}
                  label="Date of Birth"
                  value={profile.dob || "Not set"}
                />
                <ProfileRow
                  icon={<MapPin className="w-5 h-5" />}
                  label="Place of Birth"
                  value={profile.placeOfBirth || "Not set"}
                />
                <ProfileRow
                  icon={<Clock className="w-5 h-5" />}
                  label="Time of Birth"
                  value={profile.timeOfBirth || "Not set"}
                />
                <ProfileRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  }
                  label="Language"
                  value={
                    Array.isArray(profile.language)
                      ? profile.language.join(", ")
                      : profile.language || "Not set"
                  }
                />
                <ProfileRow
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                  label="Topics"
                  value={
                    Array.isArray(profile.topic)
                      ? profile.topic.join(", ")
                      : profile.topic || "Not set"
                  }
                />
                {profile.aboutUs && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 mb-1.5">About</p>
                    <p className="text-gray-700 leading-relaxed">{profile.aboutUs}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const isNotSet = value === "Not set";
  return (
    <div className="flex items-center gap-4 py-3.5 px-2 border-b border-gray-50 last:border-b-0 group hover:bg-orange-50/40 rounded-lg transition-colors -mx-2">
      <div className="text-orange-400 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-base font-medium truncate ${isNotSet ? "text-gray-300 italic" : "text-gray-800"}`}>
          {value}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-200 flex-shrink-0" />
    </div>
  );
}
