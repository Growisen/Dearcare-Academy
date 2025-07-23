"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface PasswordUpdateFormProps {
  userId: number | string;
  userType: 'student' | 'supervisor';
}

export default function PasswordUpdateForm({ userId, userType }: PasswordUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    passwordsMatch: false
  });

  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password)
    };
  };

  const handlePasswordChange = (field: string, value: string) => {
    const newPasswords = { ...passwords, [field]: value };
    setPasswords(newPasswords);

    if (field === 'newPassword') {
      const validation = validatePassword(value);
      setValidations({
        ...validation,
        passwordsMatch: value === newPasswords.confirmPassword && value !== ''
      });
    } else if (field === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        passwordsMatch: value === newPasswords.newPassword && value !== ''
      }));
    }
  };

  const isFormValid = () => {
    return (
      passwords.currentPassword &&
      passwords.newPassword &&
      passwords.confirmPassword &&
      validations.minLength &&
      validations.hasUppercase &&
      validations.hasLowercase &&
      validations.hasNumber &&
      validations.passwordsMatch
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password updated successfully!');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setValidations({
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          passwordsMatch: false
        });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
      {isValid ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Lock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              value={passwords.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={passwords.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {passwords.newPassword && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
              <ValidationItem isValid={validations.minLength} text="At least 8 characters long" />
              <ValidationItem isValid={validations.hasUppercase} text="Contains uppercase letter (A-Z)" />
              <ValidationItem isValid={validations.hasLowercase} text="Contains lowercase letter (a-z)" />
              <ValidationItem isValid={validations.hasNumber} text="Contains number (0-9)" />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={passwords.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Match Validation */}
          {passwords.confirmPassword && (
            <div className="mt-2">
              <ValidationItem 
                isValid={validations.passwordsMatch} 
                text="Passwords match" 
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !isFormValid() || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
