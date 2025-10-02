// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';

// A simple functional component for styling the button
const ActionButton = ({ onClick, children }) => (
  <button onClick={onClick} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', margin: '10px' }}>
    {children}
  </button>
);

const Dashboard = ({ userToken, onLogout }) => {
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  // ✨ NEW: State for crop suggestions ✨
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [cropInfo, setCropInfo] = useState(null);


  // ✨ NEW: This effect runs whenever the 'location' state changes ✨
  useEffect(() => {
    if (location) {
      const fetchCrops = async () => {
        setIsLoadingSuggestions(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suggest-crops`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`, // Send the auth token
            },
            body: JSON.stringify(location),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch crop suggestions.');
          }

          const data = await response.json();
          setSuggestions(data.suggestions);
          setCropInfo({ region: data.region, season: data.season });

        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };

      fetchCrops();
    }
  }, [location, userToken]); // Dependency array: runs when location or userToken changes
  
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    // This is the core Geolocation API call
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        setIsLocating(false);
      },
      // Error callback
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission was denied. Please enable it to get crop suggestions.');
        } else {
          setError('Could not get location. Please try again.');
        }
        setIsLocating(false);
      }
    );
  };
  
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to Krishi Mitra!</h1>
      <p>Let's find the best crops for you to grow.</p>
      
      {!location && (
        <ActionButton onClick={handleGetLocation}>
          {isLocating ? 'Getting Location...' : 'Get My Location'}
        </ActionButton>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {location && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <h3>Your Location:</h3>
          <p>Latitude: {location.lat.toFixed(4)}</p>
          <p>Longitude: {location.lon.toFixed(4)}</p>
        </div>
      )}
       {/* ✨ NEW: Display area for crop suggestions ✨ */}
      {isLoadingSuggestions && <p>Finding the best crops for your area...</p>}

      {suggestions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Top Crop Suggestions</h2>
          <p>For your region (<strong>{cropInfo.region}</strong>) during the <strong>{cropInfo.season}</strong> season:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {suggestions.map((crop) => (
              <li key={crop} style={{ background: '#28a745', color: 'white', padding: '15px', margin: '10px auto', borderRadius: '8px', maxWidth: '300px' }}>
                {crop}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ marginTop: '50px' }}>
        <ActionButton onClick={onLogout}>Logout</ActionButton>
      </div>
    </div>
  );
};

export default Dashboard;