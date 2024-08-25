const http = require('http');
const express = require('express');
const {server: SocketServer} = require('socket.io');
const pty = require('node-pty');
const os = require('os');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 70,
  rows: 30,
  cwd: process.env.INIT_CWD,
  env: process.env
});

const app = express();
const port = 9000;
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
})

io.attach(server);

ptyProcess.onData((data) => {
    io.emit('terminal:data', data)
  });

io.on('connection', (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    })
})

server.listen(port, ()=> console.log(`Docker Server Running on port ${port}`));