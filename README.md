# Spectra Server side reference

## Server (`index.js`)

The server is built with Node.js and the **Express.js** framework. It handles HTTP requests and manages data flow between the sensor, the AI, and the user interface.

### Dependencies

- **Express**: a library to handle HTTP requests effectively.
- **cors**: allows communication between the server and `index.html`.
- **body-parser**: reads JSON data from HTTP requests.
- **GoogleGenerativeAI**: a library to integrate the Gemini API.

---

### Endpoints

- `app.use(express.static(path.join(__dirname, 'public')));`: connects to our `index.html` user interface.
- `app.post('/data', ...)`: The ESP device is **SENDING** sensor data to `/data`, and we are **receiving** that data here.
- `app.get('/data', ...)`: This allows the page to read the latest sensor data.
- `app.post('/ask-ai', ...)`: Here we are **sending** the user's query to the Gemini API and **receiving** its response. This endpoint is called on the user side to interact with the AI.

---

### Server Operations

- `app.listen(port, "0.0.0.0", ...)`: We use this to run the server.
