// client/src/components/Login.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between Sign In and Sign Up
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const endpoint = isSignUp ? '/api/signup' : '/api/login';
    const url = `${import.meta.env.VITE_API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (isSignUp) {
          toast.success(data.message);
          setIsSignUp(false); // Switch to Sign In view after successful signup
        } else {
          // It's a login, call the success handler from App.jsx
          onLoginSuccess(data.token);
        }
      } else {
        toast.error(data.message || 'An error occurred.');
      }
    } catch (error) {
      toast.error('An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Create Account' : 'Krishi Mitra Sign In'}</h2>
        <p>{isSignUp ? 'Sign up to get started.' : 'Enter your credentials to log in.'}</p>
        
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
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: '#28a745', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;