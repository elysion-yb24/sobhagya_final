"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUserDetails } from "@/app/utils/auth-utils";
import { getApiBaseUrl } from "@/app/config/api";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Edit2, Trash2, X } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    gender: "",
    placeOfBirth: "",
    dateOfBirth: "",
    timeOfBirth: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Family members state
  const [familyMembers, setFamilyMembers] = useState<Array<{
    id: string;
    name: string;
    relationship: string;
    gender: string;
    placeOfBirth: string;
    dateOfBirth: string;
    timeOfBirth: string;
  }>>([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamilyIndex, setEditingFamilyIndex] = useState<number | null>(null);
  const [familyFormData, setFamilyFormData] = useState({
    name: "",
    relationship: "",
    gender: "",
    placeOfBirth: "",
    dateOfBirth: "",
    timeOfBirth: "",
  });
  const [familyErrors, setFamilyErrors] = useState<Record<string, string>>({});
  const [familyFilteredCities, setFamilyFilteredCities] = useState<string[]>([]);
  const [showFamilyCityDropdown, setShowFamilyCityDropdown] = useState(false);

  // Comprehensive list of Indian cities
  const cityList = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Rajkot",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Kalyan", "Vasai-Virar", "Varanasi", "Srinagar",
    "Aurangabad", "Navi Mumbai", "Solapur", "Ranchi", "Jabalpur", "Gwalior", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai",
    "Raipur", "Kota", "Guwahati", "Chandigarh", "Mysore", "Bareilly", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar",
    "Salem", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur",
    "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela",
    "Nanded", "Kolhapur", "Ajmer", "Akola", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
    "Jammu", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Maheshtala",
    "Tiruppur", "Davangere", "Kozhikode", "Akbarpur", "Bokaro", "Shahjahanpur", "Mirzapur", "Supaul", "Prayagraj", "Haldwani",
    "Bilaspur", "Dhanbad", "Amritsar", "Haora", "New Delhi", "Puducherry", "Shimla", "Puri", "Murtazabad", "Shrirampur",
  ];

  useEffect(() => {
    // Load user data
    const loadUserData = () => {
      const userDetails = getUserDetails();
      if (!userDetails) {
        toast.error("Please login to view your profile");
        router.push('/login');
        return;
      }

      // Format date of birth for input (YYYY-MM-DD)
      let formattedDob = "";
      if (userDetails.dateOfBirth) {
        if (typeof userDetails.dateOfBirth === 'string') {
          // Try to parse different date formats
          const dateStr = userDetails.dateOfBirth;
          if (dateStr.includes('-')) {
            formattedDob = dateStr.split('T')[0]; // Handle ISO format
          } else {
            // Try to parse other formats
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              formattedDob = date.toISOString().split('T')[0];
            }
          }
        }
      }

      // Format time of birth for input (HH:MM)
      let formattedTime = "";
      if (userDetails.timeOfBirth) {
        const timeStr = userDetails.timeOfBirth.toString();
        if (timeStr.includes(':')) {
          formattedTime = timeStr.split(':').slice(0, 2).join(':');
        }
      }

      setFormData({
        name: userDetails.name || userDetails.firstName ? `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() : "",
        phoneNumber: userDetails.phoneNumber || "",
        gender: userDetails.gender || "",
        placeOfBirth: userDetails.placeOfBirth || "",
        dateOfBirth: formattedDob,
        timeOfBirth: formattedTime,
      });

      // Load family members
      if (userDetails.familyMembers && Array.isArray(userDetails.familyMembers)) {
        setFamilyMembers(userDetails.familyMembers);
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [router]);

  // Helper function to check if a string is a phone number
  const isPhoneNumber = (str: string): boolean => {
    if (!str) return false;
    const phonePattern = /^[\d\s\+\-\(\)]+$/;
    const digitCount = (str.match(/\d/g) || []).length;
    return phonePattern.test(str) && digitCount >= 10;
  };

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      return "Only letters and spaces are allowed";
    }
    const words = name.trim().split(" ").filter(Boolean);
    if (words.some((w) => w.length < 2)) {
      return "Each word must have at least 2 letters";
    }
    if (/^(.)\1{2,}$/.test(name.replace(/\s/g, ""))) {
      return "Name cannot be just repeated characters";
    }
    if (name.length > 40) {
      return "Name is too long";
    }
    return "";
  };

  const validateDateOfBirth = (date: string): string => {
    if (!date) {
      return "Date of birth is required";
    }
    const selectedDate = new Date(date);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > currentDate) {
      return "Date of birth cannot be in the future";
    }
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle place of birth autocomplete
    if (field === 'placeOfBirth') {
      if (value.trim()) {
        const filtered = cityList.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCities(filtered);
        setShowCityDropdown(true);

        const exactMatch = cityList.find(city =>
          city.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
          setShowCityDropdown(false);
        }
      } else {
        setFilteredCities([]);
        setShowCityDropdown(false);
      }
    }
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, placeOfBirth: city }));
    setShowCityDropdown(false);
    setFilteredCities([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = "Place of birth is required";
    } else {
      const isValidCity = cityList.some(city =>
        city.toLowerCase() === formData.placeOfBirth.toLowerCase()
      );
      if (!isValidCity) {
        newErrors.placeOfBirth = "Please select a valid city from the list";
      }
    }

    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    if (!formData.timeOfBirth) {
      newErrors.timeOfBirth = "Time of birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const baseUrl = getApiBaseUrl() || 'https://micro.sobhagya.in';

      // Prepare the data
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Format date of birth for backend (YYYY-MM-DD)
      const dobDate = new Date(formData.dateOfBirth);
      const formattedDob = dobDate.toISOString().split('T')[0];

      // Format time of birth (HH:MM)
      const timeParts = formData.timeOfBirth.split(':');
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

      // Format family members data
      const formattedFamilyMembers = familyMembers.map(member => {
        const memberDobDate = new Date(member.dateOfBirth);
        const memberFormattedDob = memberDobDate.toISOString().split('T')[0];
        const memberTimeParts = member.timeOfBirth.split(':');
        const memberFormattedTime = `${memberTimeParts[0]}:${memberTimeParts[1]}`;

        return {
          name: member.name.trim(),
          relationship: member.relationship.trim(),
          gender: member.gender,
          placeOfBirth: member.placeOfBirth.trim(),
          dob: memberFormattedDob,
          dateOfBirth: memberFormattedDob,
          timeOfBirth: memberFormattedTime,
        };
      });

      // Format data to match backend expectations (same format as send-otp)
      const profileData = {
        name: formData.name.trim(),
        firstName,
        lastName,
        gender: formData.gender,
        placeOfBirth: formData.placeOfBirth.trim(),
        dob: formattedDob, // Backend expects 'dob' not 'dateOfBirth'
        dateOfBirth: formattedDob, // Keep both for compatibility
        timeOfBirth: formattedTime,
        phone: formData.phoneNumber, // Backend expects 'phone' not 'phoneNumber'
        phoneNumber: formData.phoneNumber, // Keep both for compatibility
        profileCompleted: true,
        familyMembers: formattedFamilyMembers, // Include family members
      };

      // Update user details in localStorage
      const userDetails = getUserDetails();
      const updatedUserDetails = {
        ...userDetails,
        ...profileData,
        displayName: formData.name.trim(),
        familyMembers: formattedFamilyMembers,
        updatedAt: new Date().getTime(),
      };
      localStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));

      // Send to backend to save in MongoDB
      if (token) {
        try {
          const userId = userDetails?.id || userDetails?._id;
          if (!userId) {
            console.error('❌ No user ID found');
            toast.error("User ID not found. Please login again.");
            return;
          }

          console.log('📤 Sending profile data to backend:', profileData);
          console.log('📤 User ID:', userId);

          // Use Next.js API route to proxy the request (handles CORS and routing)
          const apiUrl = `/api/user/profile`;
          console.log('📤 API URL:', apiUrl);

          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...profileData,
              userId, // Include userId in body for the proxy route
            }),
          });

          // Clone response to read it multiple times if needed
          const responseClone = response.clone();
          let responseData: any;
          let responseText: string;

          try {
            responseText = await response.text();
            console.log('📥 Backend response status:', response.status);
            console.log('📥 Backend response text (first 500 chars):', responseText.substring(0, 500));

            // Try to parse as JSON
            try {
              responseData = JSON.parse(responseText);
            } catch (parseError) {
              // If it's HTML (like the error page), extract the error message
              if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
                const errorMatch = responseText.match(/<pre>(.*?)<\/pre>/i);
                const errorMsg = errorMatch ? errorMatch[1] : 'Server returned HTML error page';
                responseData = {
                  message: errorMsg,
                  error: 'Invalid endpoint or server error'
                };
                console.error('❌ Server returned HTML error page:', errorMsg);
              } else {
                responseData = {
                  message: responseText || 'Invalid response from server',
                  error: 'Failed to parse response'
                };
              }
            }
          } catch (readError) {
            console.error('❌ Failed to read response:', readError);
            responseData = {
              message: 'Failed to read server response',
              error: 'Network or server error'
            };
            responseText = '';
          }

          if (response.ok) {
            console.log('✅ Profile successfully saved to MongoDB:', responseData);
            toast.success("Profile updated successfully and saved to database!");
          } else {
            console.error('❌ Failed to update profile on backend:', {
              status: response.status,
              statusText: response.statusText,
              url: `${baseUrl}/user/api/users/${userId}`,
              data: responseData
            });

            // Provide user-friendly error message
            let errorMsg = 'Failed to save to database';
            if (response.status === 404) {
              errorMsg = 'Profile update endpoint not found. The backend may not support profile updates yet.';
            } else if (response.status === 405) {
              errorMsg = 'Update method not allowed. Please contact support.';
            } else if (response.status === 401 || response.status === 403) {
              errorMsg = 'Authentication failed. Please login again.';
            } else if (responseData?.message) {
              errorMsg = responseData.message;
            } else if (responseData?.error) {
              errorMsg = responseData.error;
            }

            toast.error(errorMsg);
            // Still show success for local save, but warn about database
          }
        } catch (apiError: any) {
          console.error('❌ Error updating profile on backend:', apiError);
          toast.error(`Network error: ${apiError.message || 'Failed to connect to server'}`);
          // Still show success for local save
        }
      } else {
        console.warn('⚠️ No authentication token found, profile saved locally only');
        toast.success("Profile updated locally (please login to save to database)");
      }

      // Dispatch event to update header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-changed'));
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Family Members Functions
  const openFamilyModal = (index: number | null = null) => {
    if (index !== null && familyMembers[index]) {
      const member = familyMembers[index];
      setFamilyFormData({
        name: member.name,
        relationship: member.relationship,
        gender: member.gender,
        placeOfBirth: member.placeOfBirth,
        dateOfBirth: member.dateOfBirth,
        timeOfBirth: member.timeOfBirth,
      });
      setEditingFamilyIndex(index);
    } else {
      setFamilyFormData({
        name: "",
        relationship: "",
        gender: "",
        placeOfBirth: "",
        dateOfBirth: "",
        timeOfBirth: "",
      });
      setEditingFamilyIndex(null);
    }
    setFamilyErrors({});
    setShowFamilyModal(true);
  };

  const closeFamilyModal = () => {
    setShowFamilyModal(false);
    setEditingFamilyIndex(null);
    setFamilyFormData({
      name: "",
      relationship: "",
      gender: "",
      placeOfBirth: "",
      dateOfBirth: "",
      timeOfBirth: "",
    });
    setFamilyErrors({});
    setFamilyFilteredCities([]);
    setShowFamilyCityDropdown(false);
  };

  const handleFamilyInputChange = (field: string, value: string) => {
    setFamilyFormData(prev => ({ ...prev, [field]: value }));

    if (familyErrors[field]) {
      setFamilyErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'placeOfBirth') {
      if (value.trim()) {
        const filtered = cityList.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        );
        setFamilyFilteredCities(filtered);
        setShowFamilyCityDropdown(true);

        const exactMatch = cityList.find(city =>
          city.toLowerCase() === value.toLowerCase()
        );
        if (exactMatch) {
          setShowFamilyCityDropdown(false);
        }
      } else {
        setFamilyFilteredCities([]);
        setShowFamilyCityDropdown(false);
      }
    }
  };

  const handleFamilyCitySelect = (city: string) => {
    setFamilyFormData(prev => ({ ...prev, placeOfBirth: city }));
    setShowFamilyCityDropdown(false);
    setFamilyFilteredCities([]);
  };

  const validateFamilyForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateName(familyFormData.name);
    if (nameError) newErrors.name = nameError;

    if (!familyFormData.relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    }

    if (!familyFormData.gender) {
      newErrors.gender = "Please select gender";
    }

    if (!familyFormData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = "Place of birth is required";
    } else {
      const isValidCity = cityList.some(city =>
        city.toLowerCase() === familyFormData.placeOfBirth.toLowerCase()
      );
      if (!isValidCity) {
        newErrors.placeOfBirth = "Please select a valid city from the list";
      }
    }

    const dobError = validateDateOfBirth(familyFormData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;

    if (!familyFormData.timeOfBirth) {
      newErrors.timeOfBirth = "Time of birth is required";
    }

    setFamilyErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFamilyMember = () => {
    if (!validateFamilyForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const newMember = {
      id: editingFamilyIndex !== null ? familyMembers[editingFamilyIndex].id : `family_${Date.now()}`,
      name: familyFormData.name.trim(),
      relationship: familyFormData.relationship.trim(),
      gender: familyFormData.gender,
      placeOfBirth: familyFormData.placeOfBirth.trim(),
      dateOfBirth: familyFormData.dateOfBirth,
      timeOfBirth: familyFormData.timeOfBirth,
    };

    if (editingFamilyIndex !== null) {
      // Update existing member
      const updated = [...familyMembers];
      updated[editingFamilyIndex] = newMember;
      setFamilyMembers(updated);
      toast.success("Family member updated successfully");
    } else {
      // Add new member
      if (familyMembers.length >= 4) {
        toast.error("You can add up to 4 family members only");
        return;
      }
      setFamilyMembers([...familyMembers, newMember]);
      toast.success("Family member added successfully");
    }

    closeFamilyModal();
  };

  const handleDeleteFamilyMember = (index: number) => {
    if (window.confirm("Are you sure you want to remove this family member?")) {
      const updated = familyMembers.filter((_, i) => i !== index);
      setFamilyMembers(updated);
      toast.success("Family member removed successfully");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6 md:px-9">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10"
        >
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              View and edit your profile information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Number (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                {[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Place of Birth */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Place of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                onFocus={() => {
                  if (formData.placeOfBirth) {
                    const filtered = cityList.filter(city =>
                      city.toLowerCase().includes(formData.placeOfBirth.toLowerCase())
                    );
                    setFilteredCities(filtered);
                    setShowCityDropdown(true);
                  }
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.placeOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your place of birth"
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
              {errors.placeOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.placeOfBirth}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.timeOfBirth}
                onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.timeOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.timeOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.timeOfBirth}</p>
              )}
            </div>

            {/* Family Members Section */}
            <div className="pt-6 border-t-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add up to 4 family members for personalized astrological guidance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openFamilyModal()}
                  disabled={familyMembers.length >= 4}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${familyMembers.length >= 4
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                  <Plus className="w-5 h-5" />
                  Add Member
                </button>
              </div>

              {familyMembers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No family members added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add Member" to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{member.relationship}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openFamilyModal(index)}
                            className="p-2 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFamilyMember(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-semibold">Gender:</span> <span className="capitalize">{member.gender}</span></p>
                        <p><span className="font-semibold">Place of Birth:</span> {member.placeOfBirth}</p>
                        <p><span className="font-semibold">Date of Birth:</span> {new Date(member.dateOfBirth).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Time of Birth:</span> {member.timeOfBirth}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div >
      </div >

      {/* Family Member Modal */}
      {
        showFamilyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFamilyIndex !== null ? 'Edit Family Member' : 'Add Family Member'}
                </h2>
                <button
                  onClick={closeFamilyModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddFamilyMember(); }} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={familyFormData.name}
                    onChange={(e) => handleFamilyInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${familyErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter full name"
                  />
                  {familyErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.name}</p>
                  )}
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={familyFormData.relationship}
                    onChange={(e) => handleFamilyInputChange('relationship', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${familyErrors.relationship ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="other">Other</option>
                  </select>
                  {familyErrors.relationship && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.relationship}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="familyGender"
                          value={option.value}
                          checked={familyFormData.gender === option.value}
                          onChange={(e) => handleFamilyInputChange('gender', e.target.value)}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {familyErrors.gender && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.gender}</p>
                  )}
                </div>

                {/* Place of Birth */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Place of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={familyFormData.placeOfBirth}
                    onChange={(e) => handleFamilyInputChange('placeOfBirth', e.target.value)}
                    onFocus={() => {
                      if (familyFormData.placeOfBirth) {
                        const filtered = cityList.filter(city =>
                          city.toLowerCase().includes(familyFormData.placeOfBirth.toLowerCase())
                        );
                        setFamilyFilteredCities(filtered);
                        setShowFamilyCityDropdown(true);
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${familyErrors.placeOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter place of birth"
                  />
                  {showFamilyCityDropdown && familyFilteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {familyFilteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleFamilyCitySelect(city)}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                  {familyErrors.placeOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.placeOfBirth}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={familyFormData.dateOfBirth}
                    onChange={(e) => handleFamilyInputChange('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${familyErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {familyErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Time of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={familyFormData.timeOfBirth}
                    onChange={(e) => handleFamilyInputChange('timeOfBirth', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${familyErrors.timeOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {familyErrors.timeOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{familyErrors.timeOfBirth}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeFamilyModal}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl"
                  >
                    {editingFamilyIndex !== null ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )
      }
    </div >
  );
}

