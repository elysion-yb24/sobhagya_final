"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getUserDetails } from "@/app/utils/auth-utils";
import { getApiBaseUrl } from "@/app/config/api";
import toast from "react-hot-toast";

export default function ProfileCompletePage() {
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
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

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
    // Auto-fill phone number from user details
    const userDetails = getUserDetails();
    if (userDetails?.phoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: userDetails.phoneNumber,
      }));
    }

    // If user already has a name, they might not be a new user
    if (userDetails?.name && userDetails?.name.trim() !== '' && !isPhoneNumber(userDetails.name)) {
      // User already has profile, redirect away
      router.push('/astrologers');
    }
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
      };

      // Update user details in localStorage
      const userDetails = getUserDetails();
      const updatedUserDetails = {
        ...userDetails,
        ...profileData,
        displayName: formData.name.trim(),
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
            toast.success("Profile completed successfully and saved to database!");
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
        toast.success("Profile completed locally (please login to save to database)");
      }
      
      // Dispatch event to update header
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-changed'));
      }

      // Redirect to astrologers page
      setTimeout(() => {
        router.push('/astrologers');
      }, 500);

    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 sm:p-6 md:p-9 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10"
      >
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Please provide your details to get personalized astrological guidance
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
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
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
            <p className="text-xs text-gray-500 mt-1">Phone number is automatically filled from your login</p>
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
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.placeOfBirth ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.timeOfBirth ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.timeOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.timeOfBirth}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

