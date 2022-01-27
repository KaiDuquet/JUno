const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" }});

app.use(express.static(`${__dirname}/../public`));

const state = {};
const clientRooms = {};

const MAX_PLAYERS = 6;

io.on('connection', client => {

    client.on('createGame', handleCreateGame);
    client.on('joinGame', handleJoinGame);

    function handleCreateGame() {
        let roomID = genID(6);
        clientRooms[client.id] = roomID;
        client.emit('gameCode', roomID);

        const player = {
            playerID: 1,
        }

        state[roomID] = createBlankState();
        state[roomID].safe.players.push(player);

        client.join(roomID);
        client.emit('joinSuccess', state[roomID].safe.players);
    }

    function handleJoinGame(roomID) {
        const room = io.sockets.adapter.rooms.get(roomID);
        
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }

        if (numClients === 0)
        {
            client.emit('gameNotFound', roomID);
            return;
        }
        else if (numClients >= MAX_PLAYERS) {
            client.emit('roomAlreadyFull', roomID);
            return;
        }

        clientRooms[client.id] = roomID;

        const player = {
            playerID: numClients + 1,
        }

        state[roomID].safe.players.push(player);

        client.join(roomID);
        client.emit('joinSuccess', state[roomID].safe.players);
        client.broadcast.emit('playerJoined', player);
    }
});

server.on('error', (err) => {
    console.error(err);
});

server.listen(9090, () => {
    console.log('Server is ready');
});

function createBlankState() {
    const state = {
        safe: {
            players: [
                
            ],
            topCard: {

            }
        },
        playerHands: [

        ],
        deck: [

        ]
    }
    return state;
}

function genID(length) {
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const numChars = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * numChars));
    }

    return result;
}


////////////////////// ------------- GAME SECTION ------------- //////////////////////

const RED = 0; const YELLOW = 1;
const BLUE = 2; const GREEN = 3;
const WILD = 4;

const N0 = 0; const N1 = 1; const N2 = 2; const N3 = 3; const N4 = 4;
const N5 = 5; const N6 = 6; const N7 = 7; const N8 = 8; const N9 = 9;

const PLUS_2 = 10; const REVERSE = 11; const SKIP = 12; const CHOOSE = 13; const PLUS_4 = 14;

class Deck {

    constructor(deck = createDeck()) {
        this.deck = deck;
    }

    shuffle() {
        for (let i = 1; i < deck.length; i++) {
            const newIndex = Math.floor(Math.random() * (i + 1));
            const swappedCard = deck[newIndex];
            deck[newIndex] = deck[i];
            deck[i] = swappedCard;
        }
    }

    getRawObj() {
        return this.deck;
    }
}

function createDeck() {
    let deck = []
    for (let color = RED; color <= GREEN; color++) {
        deck.push({color: color, type: N0});

        for (let type = N1; type <= SKIP; type++) {
            deck.push({color: color, type: type});
            deck.push({color: color, type: type});
        }

        deck.push({color: WILD, type: CHOOSE});
        deck.push({color: WILD, type: PLUS_4});
    }

    return deck;
}