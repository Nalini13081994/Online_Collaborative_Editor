const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("Gemini Key Status:", process.env.GEMINI_API_KEY ? "Loaded (Length: " + process.env.GEMINI_API_KEY.length + ")" : "NOT LOADED");

const app = express();
app.use(cors());
app.use(express.json());


const convertRoute = require("./routes/convert");
app.use("/api/convert", convertRoute);

const autocompleteRoute = require("./routes/autocomplete")
app.use("/api/autocomplete", autocompleteRoute)



app.listen(process.env.PORT, () => {
  console.log("Backend running on port " + process.env.PORT);
});

const http = require('http');
const { WebSocketServer } = require('ws')
const {setupWSConnection} = require('y-websocket/bin/utils.js')
const port = 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Yjs WebSocket server");
});

const wss = new WebSocketServer({server})

// optional: log connections

  wss.on('connection', (ws, req) => {
  // room name from URL: ws://localhost:1234/<room-name>
  setupWSConnection(ws, req);
});


server.listen(port, () => {
  console.log(`Yjs WebSocket server running at ws://localhost:${port}`);
});

