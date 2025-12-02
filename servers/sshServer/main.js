import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Client } from "ssh2";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://212.85.1.223:3000"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  let conn = null;

  socket.on("ssh-connect", (config) => {
    console.log("Tentando conexão SSH com:", config.host);

    conn = new Client();
    conn
      .on("ready", () => {
        console.log("Conectado ao servidor SSH");
        socket.emit("ssh-ready");

        conn.shell((err, stream) => {
          if (err) {
            socket.emit("output", `Erro: ${err.message}`);
            return;
          }

          // saída do servidor SSH -> navegador
          stream.on("data", (data) => {
            socket.emit("output", data.toString());
          });

          // entrada do navegador -> servidor SSH
          socket.on("input", (data) => {
            stream.write(data);
          });

          stream.on("close", () => {
            console.log("Conexão SSH encerrada");
            socket.emit("ssh-close");
            conn.end();
          });

          socket.on("disconnect", () => {
            if (stream) stream.end();
            if (conn) conn.end();
          });
        });
      })
      .on("error", (err) => {
        console.error("Erro SSH:", err);
        socket.emit("ssh-error", err.message);
      })
      .connect(config);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
    if (conn) conn.end();
  });
});

server.listen(3004, () => {
  console.log("Servidor SSH socket rodando em http://localhost:3004");
});