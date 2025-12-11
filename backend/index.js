require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const app = require('./app');

const port = process.env.PORT || 5000;

// Crear servidores
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('wss', wss);

// Lógica de WebSocket (Conexión)
wss.on('connection', (ws) => {
  console.log('Cliente conectado vía WebSocket');
  
  ws.on('message', (message) => {
    console.log('Mensaje recibido por WS:', message);
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});