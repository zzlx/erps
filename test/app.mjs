import express from 'express';
import http from 'http';
import settings from '../src/settings/index.mjs';
import { Server } from 'socket.io';
const paths = settings.paths;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(paths.TEST + '/chat.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
