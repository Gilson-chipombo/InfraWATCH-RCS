import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function initSocket(server: any)
{
  io = new SocketIOServer(server,
  {
    cors:
    {
      origin: '*',
    },
  });

  io.on('connection', (socket) =>
  {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.emit("teste", "ok");

    socket.on('disconnect', () => 
    {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
  return io;
}

export function getIO(): SocketIOServer
{
  if (!io)
  {
    throw new Error("Socket.io não foi inicializado ainda!");
  }
  return io;
}
