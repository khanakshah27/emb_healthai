const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


const apikey = process.env.API_KEY; //
const genAI = new GoogleGenerativeAI(apikey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
console.log("Attempting to use API Key:",apikey); 

let latestData = {};
let lastAIResponse = "";


app.get('/', (req, res) => {
    res.status(200).send('Server running!');
})

//in arduino code, esp is SENDING sensor data to /data, we are receiving that data here
app.post('/data', (req, res) => {
  latestData = req.body || {};
  console.log('Received sensor data:', latestData);
  res.status(200).send('Data received');
});

// allow page to read the latest sensor data
app.get('/data', (req, res) => {
  res.json(latestData || {});
});



// **important**
app.post('/ask-ai', async (req, res) => {
  const userQuery = (req.body && req.body.query) ? String(req.body.query) : "";

  if (!latestData || Object.keys(latestData).length === 0) {
    return res.status(400).send({ error: 'No health data available yet.' });
  }
  if (!userQuery.trim()) {
    return res.status(400).send({ error: 'Empty query' });
  }

  //prompt template can be customised to anything
  const prompt = `You are a health assistant AI. Here is the user health data:  
- Heart Rate: ${latestData.heartRate}
- SpO₂: ${latestData.spo2}
- Temp: ${latestData.temperature}°C
- Steps: ${latestData.steps}
- Time: ${latestData.time}

User asked: "${userQuery}"

Provide a helpful and concise response based on this health context.`;

  try {
    const result = await model.generateContent(prompt);

    
    const response = result?.response;
    const text = typeof response?.text === 'function'
      ? response.text()
      : (response?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ') || 'No response');

    lastAIResponse = text;
    console.log('AI Response:', text);
    res.send({ response: text });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).send({ error: 'AI request failed', details: err.message });
  }
});

app.get('/last-ai', (req, res) => {
  res.json({ response: lastAIResponse || "" });
});


app.get('/', (req, res) => {  //generate user interface
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
