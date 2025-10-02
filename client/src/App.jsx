import { useState } from 'react';
import AnimatedLogin from './components/AnimatedLogin'; // ✨ IMPORT NEW COMPONENT
import Dashboard from './pages/Dashboard'; // ✨ Import the new Dashboard
import { Toaster } from 'react-hot-toast'; // ✨ 1. IMPORT

function App() {
  // ✨ CHANGE 1: Initialize state from localStorage ✨
  // When the app first loads, it checks if a token is already in storage.
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));


  const handleLoginSuccess = (token) => {
    // ✨ CHANGE 2: Save the token to localStorage upon login ✨
    localStorage.setItem('userToken', token);
    setUserToken(token);
  };

  const handleLogout = () => {
    // ✨ CHANGE 3: Remove the token from localStorage upon logout ✨
    localStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <div className="App">
      <Toaster position="top-center" /> {/* ✨ 2. ADD THE COMPONENT */}

      {userToken ? (
        // ✨ If logged in, show the Dashboard ✨
        <Dashboard userToken={userToken} onLogout={handleLogout} />
      ) : (
        <AnimatedLogin onLoginSuccess={handleLoginSuccess} /> // ✨ USE NEW COMPONENT

      )}
    </div>
  );
}

export default App;
