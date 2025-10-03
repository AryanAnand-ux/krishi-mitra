// client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const Dashboard = ({ userToken, onLogout }) => {
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [cropInfo, setCropInfo] = useState(null);
  const [currentDate] = useState(getFormattedDate());

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported.');
      toast.error('Geolocation is not supported.');
      return;
    }
    setAddress(null);
    setSuggestions([]);
    setWeather(null);
    setError('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lon: longitude };
        setLocation(newLocation); // Set coordinates to trigger data fetching

        try {
          // Fetch Address
          const geoApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
          const addressResponse = await fetch(geoApiUrl);
          const addressData = await addressResponse.json();
          if (addressData.address) {
            setAddress({
              cityName: addressData.address.city || addressData.address.town || addressData.address.village || 'N/A',
              district: addressData.address.state_district || 'N/A',
              state: addressData.address.state || 'N/A',
            });
          }
        } catch (geoError) {
          setError('Could not fetch address details.');
          toast.error('Could not fetch address details.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission was denied.');
          toast.error('Location permission was denied.');
        } else {
          setError('Could not get your location.');
          toast.error('Could not get your location.');
        }
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    handleGetLocation(); // Get initial location when component mounts
  }, []);

  useEffect(() => {
    // This effect runs whenever the location is updated
    if (location && userToken) {
      const fetchData = async () => {
        setIsLoadingSuggestions(true);
        try {
          // Set up both API calls
          const cropsPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suggest-crops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify(location),
          });
          const weatherPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/weather`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify(location),
          });

          // Wait for both to complete
          const [cropsResponse, weatherResponse] = await Promise.all([cropsPromise, weatherPromise]);
          if (!cropsResponse.ok || !weatherResponse.ok) {
            throw new Error('Failed to fetch data from the server.');
          }
          const cropsData = await cropsResponse.json();
          const weatherData = await weatherResponse.json();

          // Update state with new data
          setSuggestions(cropsData.suggestions);
          setCropInfo({ region: cropsData.region, season: cropsData.season });
          setWeather(weatherData);
        } catch (err) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchData();
    }
  }, [location, userToken]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Namaste, Farmer 👩‍🌾</h1>
              <p className="text-md text-gray-500 dark:text-gray-400">{currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button onClick={onLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300">
                Logout
              </button>
            </div>
          </div>
        </motion.header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Location</h2>
                  {isLocating && <p className="text-gray-600 dark:text-gray-300">Detecting location...</p>}
                  {error && <p className="text-red-500 font-semibold">{error}</p>}
                  {address && (
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {address.cityName}, {address.district}, {address.state}
                    </p>
                  )}
                </div>
                <button onClick={handleGetLocation} disabled={isLocating} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-gray-400">
                  📍 Update
                </button>
              </div>
            </motion.div>

            {(isLoadingSuggestions) && <p className="text-center text-gray-600 dark:text-gray-300">Finding crop and weather data...</p>}
            
            {suggestions.length > 0 && (
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Top Crop Suggestions</h2>
                <p className="text-md text-gray-500 dark:text-gray-400 mb-4">
                  Based on your region (<strong>{cropInfo.region}</strong>) and the current <strong>{cropInfo.season}</strong> season:
                </p>
                <motion.ul
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {suggestions.map((crop) => (
                    <motion.li
                      key={crop}
                      className="bg-green-500 text-white text-center font-bold p-4 rounded-lg shadow-sm hover:bg-green-600 transition duration-300"
                      variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                    >
                      {crop}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            {weather && (
              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Current Weather</h2>
                <div className="flex items-center justify-center">
                  <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} className="w-20 h-20" />
                  <div className="text-5xl font-bold text-gray-800 dark:text-white">
                    {Math.round(weather.temp)}°C
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className="capitalize text-lg text-gray-600 dark:text-gray-300">{weather.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Humidity: {weather.humidity}%</p>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400">Powered by Krishi Mitra 🌱</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;