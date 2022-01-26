const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(`${__dirname}/../public`));

const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleNewGame() {
        let roomID = makeid(5);
        clientRooms[client.id] = roomID;
        client.emit('gameCode', roomID);

        state[roomID] = createGameState();

        client.join(roomID);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleJoinGame(gameCode) {
        const room = io.sockets.adapter.rooms[gameCode];

        let allPlayers;
        let numPlayers = 0;
        if (room) {
            allPlayers = room.sockets;
            numPlayers = Object.keys(allPlayers).length;
        }

        if (numPlayers === 0) {
            client.emit('gameNotFound');
            return;
        }
    }
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(9090, () => {
    console.log('Server is ready');
});