// 1. Import the express library
const express = require('express');
const cors = require('cors'); //  IMPORT THE CORS PACKAGE 
const jwt = require('jsonwebtoken'); // ✨ IMPORT JWT LIBRARY
require('dotenv').config(); // ✨ ADD THIS: Loads variables from .env file
const connectDB = require('./config/db'); // ✨ ADD THIS: Import our DB connection function
const bcrypt = require('bcrypt'); // ✨ IMPORT BCRYPT

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
// Define the list of allowed frontend URLs
const allowedOrigins = [
  'https://krishi-mitra-sage.vercel.app', // Your live Vercel frontend
  'http://localhost:5173'                 // Your local development frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// ✨ NEW: SIGN UP a new user ✨
app.post('/api/signup', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // 1. Validate input
    if (!mobileNumber || !password || password.length < 6) {
      return res.status(400).json({ message: 'Mobile number and a password of at least 6 characters are required.' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this mobile number already exists.' });
    }

    // 3. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create and save the new user
    const user = new User({
      mobileNumber,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

// ✨ REWRITTEN: LOG IN an existing user ✨
app.post('/api/login', async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    // 1. Find the user by mobile number
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the submitted password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. If passwords match, create and send a JWT
    const token = jwt.sign({ mobileNumber: user.mobileNumber }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
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