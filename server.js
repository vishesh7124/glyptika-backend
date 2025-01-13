const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Detailed CORS configuration
const corsOptions = {
  origin: ["https://glyptika-ems.vercel.app", process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Bearer token" });
  }

  const token = authHeader.split(" ")[1];

  // Use the same API key as Grist
  if (token !== process.env.GRIST_API_KEY) {
    return res.status(401).json({ error: "Invalid token" });
  }

  next();
};

// Configure Grist API settings
const gristConfig = {
  baseURL: process.env.GRIST_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
  },
};

// const GRIST_API_KEY = process.env.GRIST_API_KEY;
// const GRIST_DOC_ID = process.env.GRIST_DOC_ID;

// Endpoint to fetch employee data from Grist
app.all("/api/*", authenticateRequest, async (req, res) => {
  try {
    const gristPath = req.path.replace("/api", "");
    const response = await axios({
      method: req.method,
      url: `${gristConfig.baseURL}${gristPath}`,
      headers: {
        ...gristConfig.headers,
        "Content-Type": "application/json",
      },
      data: req.method !== "GET" ? req.body : undefined,
      params: req.query,
    });

    // Set CORS headers explicitly for each response
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials", true);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
