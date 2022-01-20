const { text } = require('express');
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(`${__dirname}/../public`));

io.on('connection', (socket) => {
    // socket.emit('message', 'You are connected');

    socket.on('message', (text) => io.emit('message', text));
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(9090, () => {
    console.log('Server is ready');
});