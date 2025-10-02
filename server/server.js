// 1. Import the express library
const express = require('express');
const cors = require('cors'); //  IMPORT THE CORS PACKAGE 
const jwt = require('jsonwebtoken'); // ✨ IMPORT JWT LIBRARY
require('dotenv').config(); // ✨ ADD THIS: Loads variables from .env file
const connectDB = require('./config/db'); // ✨ ADD THIS: Import our DB connection function
const User = require('./models/User'); // ✨ IMPORT THE USER MODEL
// 2. Create an instance of the express application
const { getSeason, getRegion, cropDatabase } = require('./cropData'); // ✨ IMPORT OUR NEW MODULES

// ✨ 1. INITIALIZE TWILIO CLIENT ✨
const twilioClient = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

connectDB(); // ✨ CONNECT TO THE DATABASE
const app = express();

// ENABLE CORS FOR ALL ROUTES 
// Be more specific about which origins are allowed
const corsOptions = {
  origin: 'https://krishi-mitra-sage.vercel.app', // Your Vercel frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json()); // ✨ ADD THIS LINE: Middleware to parse JSON bodies

// 3. Define a port for our server to listen on
const PORT = 3001;
// In a real production app, this secret should be a long, complex string stored in an environment variable, not in the code.
const JWT_SECRET = 'your-super-secret-key-for-krishi-mitra';



// ✨ NEW: Authentication Middleware ✨
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // 401 Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // 403 Forbidden (token is no longer valid)
    req.user = user; // Attach user payload to the request object
    next(); // Proceed to the next function in the chain
  });
};

// 4. Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Krishi Mitra Backend!');
});

// ✨ NEW: Create a dedicated API route that sends JSON data 
app.get('/api/welcome', (req, res) => {
  const welcomeMessage = {
    id: 1,
    message: "Welcome to Krishi Mitra! Data loaded from the backend."
  };
  res.json(welcomeMessage); // Use res.json() to send JSON
});

// --- REPLACE THE ENTIRE /api/login ROUTE WITH THIS NEW VERSION ---
app.post('/api/login', async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || mobileNumber.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  try {
    // First, save the user and OTP to our database
    await User.findOneAndUpdate(
      { mobileNumber: mobileNumber },
      { mobileNumber: mobileNumber, otp: otp, otpExpires: otpExpires },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // ✨ 2. SEND THE REAL SMS USING TWILIO ✨
    await twilioClient.messages.create({
      body: `Your Krishi Mitra OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      // IMPORTANT: Format the number for Twilio (E.164 format)
      // Since we are in India, we prepend +91
      to: `+91${mobileNumber}`,
    });

    console.log(`Successfully sent OTP to ${mobileNumber}`);
    res.status(200).json({ success: true, message: 'OTP sent successfully.' });

  } catch (error) {
    // Differentiate between Twilio errors and other errors
    if (error.code === 21211) { // Twilio error code for invalid 'To' number
        console.error('Twilio Error: Invalid phone number.', error.message);
        return res.status(400).json({ success: false, message: 'The destination phone number is not a valid number.'});
    }
    console.error('An error occurred:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});


// ✨ NEW: Handle OTP verification ✨
app.post('/api/verify', async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    // Find a user who has this mobile number, this OTP, and the OTP has not expired.
    const user = await User.findOne({
      mobileNumber: mobileNumber,
      otp: otp,
      otpExpires: { $gt: Date.now() }, // $gt means "greater than"
    });

    if (!user) {
      // If no user is found, the OTP is invalid or expired
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // --- OTP is correct ---
    // Clear the OTP for security after it's used
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create and send the JWT
    const token = jwt.sign({ mobileNumber: user.mobileNumber }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, message: 'Login successful!', token: token });

  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ✨ NEW: Secure route for crop suggestions ✨
app.post('/api/suggest-crops', authenticateToken, (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const season = getSeason();
  const region = getRegion(lat, lon);

  if (region === 'Unknown' || season === 'Unknown') {
    return res.status(404).json({ error: 'Could not determine region or season.' });
  }

  const suggestions = cropDatabase[region].seasons[season];
  res.json({ region, season, suggestions });
});


app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});