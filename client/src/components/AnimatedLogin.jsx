// client/src/components/AnimatedLogin.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AnimatedLogin = ({ onLoginSuccess }) => {
  // State and logic functions remain the same
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
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
        setIsSignUp(false); // Switch to login view
        document.getElementById('chk').checked = false;
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
<div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4">
        <div className="relative w-full max-w-sm h-[500px]">
        <input 
          type="checkbox" 
          id="chk" 
          className="hidden" 
          checked={isSignUp} 
          onChange={() => setIsSignUp(!isSignUp)} 
        />

        {/* --- Sign Up Form --- */}
        <div className={`w-full h-full absolute transition-transform duration-700 ease-in-out ${isSignUp ? 'transform-none' : 'transform scale-60 opacity-0 pointer-events-none'}`}>
          <form onSubmit={handleSignUp} className="flex flex-col items-center justify-center h-full p-6 bg-gray-800 rounded-lg shadow-lg">
            <label htmlFor="chk" className="text-white text-4xl font-bold mb-6 cursor-pointer select-none">Sign up</label>
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User name" required />
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile Number" required />
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button disabled={isLoading} className="w-4/5 p-3 mt-2 bg-purple-600 text-white rounded border-none text-lg font-bold cursor-pointer hover:bg-purple-700 disabled:bg-gray-500">
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        {/* --- Login Form --- */}
        <div className={`w-full h-full absolute transition-transform duration-700 ease-in-out ${isSignUp ? 'transform -translate-y-[500px]' : 'transform-none'}`}>
          <form onSubmit={handleLogin} className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow-lg">
            <label htmlFor="chk" className="text-purple-600 text-4xl font-bold mb-10 cursor-pointer select-none">Login</label>
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email or Mobile Number" required />
            <input className="w-4/5 p-3 mb-4 bg-gray-200 text-gray-800 rounded border-none outline-none" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" required />
            <button disabled={isLoading} className="w-4/5 p-3 mt-2 bg-purple-600 text-white rounded border-none text-lg font-bold cursor-pointer hover:bg-purple-700 disabled:bg-gray-500">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogin;