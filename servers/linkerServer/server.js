  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const path = require('path');
  const WebSocket = require('ws');
  const http = require('http');

  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  // Store connected clients
  const clients = new Map();

  app.set('wss', wss);

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        // Store client with its token
        if (data.token) {
          clients.set(data.token, ws);
        }

        // Handle different message types
        if (data.type === 'clientMessage') {
          console.log('Client message:', data.message);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Remove client from the map
      for (const [token, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(token);
          break;
        }
      }
    });
  });

  // Helper function to send messages to specific clients
  function sendToClient(token, event, data) {
    const client = clients.get(token);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }

  // Broadcast to all clients
  function broadcast(event, data) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }

  const Command = async (req, res) => {
    console.log("command")
    try {
      const { token, myself, command } = req.body;
      sendToClient(token, `command/${token}`, { command, myself });
      console.log(`command [${token}/${myself}]`, command);
      res.status(200).send({ message: 'Command sent successfully' });
    } catch (error) {
      console.error('Error processing command:', error);
      res.status(500).send({ error: 'Error processing command' });
    }
  };

  const Signal = async (req, res) => {
    console.log("signal")
    try {
      const { token, myself, command } = req.body;
      sendToClient(token, `signal/${token}`, { command, myself });
      console.log(`signal [${token}/${myself}]`, command);
      res.status(200).send({ message: 'Signal sent successfully' });
    } catch (error) {
      console.error('Error processing signal:', error);
      res.status(500).send({ error: 'Error processing signal' });
    }
  };

  const newConnect = async (req, res) => {
    try {
      const { token, device, tokenGenerated } = req.body;
      console.log(`New connection request (deviceConnect/${token}):\nFROM: ${tokenGenerated}\nTO: ${token}\nDevice: ${device}`);
      sendToClient(token, `deviceConnect/${token}`, { device, serverToken: tokenGenerated });
      res.status(200).send({ message: 'Connection request sent' });
    } catch (error) {
      console.error('Error processing new connection:', error);
      res.status(500).send({ error: 'Error processing new connection' });
    }
  };

  const acceptConnect = async (req, res) => {
  console.log("dados: ================================ ", req.body);

    try {
      const { system, platform, version, user, serverToken, mytoken } = req.body;
      console.log(`Connection acceptance:\nSystem: ${system}\nPlatform: ${platform}\nVersion: ${version}\nUser: ${user}\nToken: ${serverToken}`);
      sendToClient(serverToken, `deviceaccept/${serverToken}`, { system, platform, version, user, serverToken, mytoken });
      res.status(200).send({ message: 'Connection accepted' });
    } catch (error) {
      console.error('Error accepting connection:', error);
      res.status(500).send({ error: 'Error accepting connection' });
    }
  };

  const response = async (req, res) => {
    try {
      const { stdout, serverToken, mytoken } = req.body;
      console.log(`Response to command:\nToken: ${serverToken}\nResponse: ${JSON.stringify(stdout)}`);
      sendToClient(serverToken, `response/${serverToken}`, { stdout });
      res.status(200).send({ message: 'Response sent' });
    } catch (error) {
      console.error('Error sending response:', error);
      res.status(500).send({ error: 'Error sending response' });
    }
  };

  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));
  app.get('/shell', (req, res) => res.sendFile(path.join(__dirname, 'public', 'xterm.html')));

  app.post('/command', Command);
  app.post('/signal', Signal);
  app.post('/newConnect', newConnect);
  app.post('/acceptConnect', acceptConnect);
  app.post('/command/response', response);

  server.listen(3005, () => {
    console.log('Server running at http://localhost:3005');
  });