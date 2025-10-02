// client/src/components/Login.jsx

import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');

  // New state to control which part of the form is shown
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Handles the initial mobile number submission
  const handleMobileSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // ✨ SET LOADING TO TRUE
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Backend confirmed OTP was sent.');
        setShowOtpInput(true); // Show the OTP input field
      } else {
        alert(data.message); // Show an error message if something went wrong
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false); // ✨ SET LOADING TO FALSE
    }
  };

  // ✨ UPDATE THIS FUNCTION to call the new verify endpoint ✨
  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // ✨ SET LOADING TO TRUE
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // If login is successful, call the function passed from the parent App component
        onLoginSuccess(data.token);
      } else {
        alert(data.message); // Show error (e.g., "Invalid OTP")
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      alert('Failed to verify OTP.');
    } finally {
      setIsLoading(false); // ✨ SET LOADING TO FALSE
    }
  };

  return (
    <div className="login-container">
      {/* Conditionally render the correct form based on showOtpInput state */}
      {!showOtpInput ? (
        // --- MOBILE NUMBER FORM ---
        <form className="login-form" onSubmit={handleMobileSubmit}>
          <h2>Krishi Mitra Login</h2>
          <p>Enter your mobile number to begin</p>
          <div className="input-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g., 9876543210"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Get OTP'}
          </button>
        </form>
      ) : (
        // --- OTP INPUT FORM ---
        <form className="login-form" onSubmit={handleOtpSubmit}>
          <h2>Enter OTP</h2>
          <p>An OTP was sent to {mobileNumber}</p>
          <div className="input-group">
            <label htmlFor="otp">4-Digit OTP</label>
            <input
              type="tel"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g., 1234"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;