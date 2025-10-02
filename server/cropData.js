// server/cropData.js

// This is our simulated agricultural database.
// In a real-world scenario, this data would come from a comprehensive database
// or a specialized agricultural API.

const cropDatabase = {
  "Indo-Gangetic Plain": {
    // Covers Punjab, Haryana, UP, Bihar, West Bengal, parts of MP
    region_info: {
      lat_range: [23.0, 31.0],
      lon_range: [74.0, 88.0],
    },
    seasons: {
      Rabi: ["Wheat", "Barley", "Mustard", "Gram (Chickpea)", "Lentil (Masoor)"],
      Kharif: ["Rice (Paddy)", "Maize", "Sugarcane", "Soybean", "Cotton"],
      Zaid: ["Watermelon", "Muskmelon", "Cucumber", "Moong Dal"],
    },
  },
  "Deccan Plateau": {
    // Covers Maharashtra, Karnataka, Telangana, Andhra Pradesh
    region_info: {
      lat_range: [15.0, 21.0],
      lon_range: [73.0, 80.0],
    },
    seasons: {
      Rabi: ["Sorghum (Jowar)", "Chickpea", "Safflower", "Wheat"],
      Kharif: ["Cotton", "Millets (Bajra)", "Tur Dal (Arhar)", "Groundnut"],
      Zaid: ["Groundnut", "Maize", "Watermelon"],
    },
  },
  // We can add more regions like "Coastal Areas", "Himalayan Region", etc.
};

// Function to determine the current season in India based on the month
const getSeason = () => {
  const month = new Date().getMonth() + 1; // Month is 1 (Jan) to 12 (Dec)

  // Rabi Season (Sowing: Oct-Dec, Harvest: Mar-May)
  // Suggestions should be for Rabi from October onwards.
  if (month >= 10 || month <= 3) {
    return "Rabi";
  }
  
  // Kharif Season (Sowing: Jun-Jul, Harvest: Sep-Oct)
  // Suggestions are for Kharif from June to September.
  if (month >= 6 && month <= 9) {
    return "Kharif";
  }

  // Zaid Season (Sowing: Mar-Apr, Harvest: May-Jun)
  // Suggestions are for Zaid from March to May.
  if (month >= 3 && month <= 5) {
    return "Zaid";
  }

  return "Unknown";
};

// Function to determine the region based on lat/lon
const getRegion = (lat, lon) => {
  for (const region in cropDatabase) {
    const { lat_range, lon_range } = cropDatabase[region].region_info;
    if (lat >= lat_range[0] && lat <= lat_range[1] && lon >= lon_range[0] && lon <= lon_range[1]) {
      return region;
    }
  }
  return "Unknown";
};

module.exports = { getSeason, getRegion, cropDatabase };