

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require("dotenv")


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GRIST_API_KEY = process.env.GRIST_API_KEY;
const GRIST_DOC_ID = process.env.GRIST_DOC_ID;

// Endpoint to fetch employee data from Grist
app.get('/api/employees', async (req, res) => {
  try {
    const response = await axios.get(
      `https://docs.getgrist.com/api/docs/${GRIST_DOC_ID}/tables/Employee_Database/records`,
      {
        headers: {
          Authorization: `Bearer ${GRIST_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Grist:', error);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});