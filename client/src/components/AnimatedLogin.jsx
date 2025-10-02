// client/src/components/AnimatedLogin.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './AnimatedLogin.css'; // Import the new styles

const AnimatedLogin = ({ onLoginSuccess }) => {
  // State for all form inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // State for login form
  const [identifier, setIdentifier] = useState(''); // Can be email or mobile
  const [loginPassword, setLoginPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, mobileNumber, password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        // Maybe automatically flip to login form
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        onLoginSuccess(data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <input type="checkbox" id="chk" aria-hidden="true" />

      <div className="signup-form">
        <form onSubmit={handleSignUp}>
          <label htmlFor="chk" aria-hidden="true">Sign up</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User name" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile Number" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button disabled={isLoading}>{isLoading ? 'Signing up...' : 'Sign up'}</button>
        </form>
      </div>

      <div className="login-form">
        <form onSubmit={handleLogin}>
          <label htmlFor="chk" aria-hidden="true">Login</label>
          <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or Mobile Number" required />
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" required />
          <button disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
};

export default AnimatedLogin;