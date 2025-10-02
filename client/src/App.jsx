import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard'; // ✨ Import the new Dashboard

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
      {userToken ? (
        // ✨ If logged in, show the Dashboard ✨
        <Dashboard userToken={userToken} onLogout={handleLogout} />
      ) : (
        // If not logged in, show the Login component
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
