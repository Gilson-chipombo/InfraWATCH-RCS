const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');

const port = process.argv[2] || 9090; // Porta padrão 9090 se não for informada

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const shell = process.env.SHELL || '/bin/bash';  // Caminho absoluto
  
  // Garante um diretório válido
  const cwd = process.env.HOME || '/tmp';
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color', // Atualizado para melhor suporte a cores
    cols: 80,
    rows: 100,
    cwd: cwd,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      HOME: process.env.HOME || '/home/node'
    }
  });

  console.log(`Terminal iniciado (PID: ${ptyProcess.pid})`);

  // Envia dados do terminal para o cliente WebSocket
  ptyProcess.on('data', (data) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    } catch (e) {
      console.error('Erro ao enviar dados:', e);
    }
  });

  // Recebe dados do cliente e envia para o terminal
  ws.on('message', (msg) => {
    ptyProcess.write(msg.toString());
  });

  // Trata redimensionamento do terminal
  ws.on('resize', (size) => {
    try {
      ptyProcess.resize(size.cols || 80, size.rows || 24);
    } catch (e) {
      console.error('Erro ao redimensionar:', e);
    }
  });

  ws.on('close', () => {
    console.log('Conexão encerrada');
    ptyProcess.kill();
  });

  ws.on('error', (err) => {
    console.error('Erro na conexão WebSocket:', err);
    ptyProcess.kill();
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor WebSocket ouvindo em ws://localhost:${port}`);
});