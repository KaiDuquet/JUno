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

    console.log(io.sockets.adapter.rooms);

    client.on('createGame', handleCreateGame);
    client.on('joinGame', handleJoinGame);
    client.on('disconnect', handleDisconnect);
    client.on('startGame', handleStartGame);

    function handleCreateGame() {
        let roomID = genID(6);
        clientRooms[client.id] = roomID;
        client.emit('gameCode', roomID);

        const player = {
            playerID: 1,
        }

        state[roomID] = createBlankState();
        state[roomID].safe.players[client.id] = player;
        state[roomID].partyLeader = client.id;
        state[roomID].numPlayers = 1;

        client.join(roomID);
        client.emit('joinSuccess', state[roomID].safe.players);
        client.emit('giveStartAuth')
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

        state[roomID].safe.players[client.id] = player;
        state[roomID].numPlayers++;

        client.join(roomID);
        client.emit('joinSuccess', state[roomID].safe.players);
        client.broadcast.emit('playerJoined', player);
    }

    function handleDisconnect(reason) {
        const roomID = clientRooms[client.id];
        if (roomID) {
            io.emit('playerLeft', state[roomID].safe.players[client.id]);
            state[roomID].numPlayers--;
            delete state[roomID].safe.players[client.id];
            delete clientRooms[client.id];
            console.log(io.sockets.adapter.rooms);
        }
    }

    function handleStartGame() {
        const roomID = clientRooms[client.id];
        if (state[roomID].partyLeader === client.id) {
            console.log("Starting game...");
            startCardGame(state[roomID])

            io.emit('gameStarted');
        }
        else {
            console.log("Not authorized to start a game");
        }
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
            players: {
                
            }
        }
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

function shuffleDeck(deck) {
    for (let i = 1; i < deck.length; i++) {
        const newIndex = Math.floor(Math.random() * (i + 1));
        const swappedCard = deck[newIndex];
        deck[newIndex] = deck[i];
        deck[i] = swappedCard;
    }
    return deck;
}

function createDeck() {
    let deck = []
    for (let color = RED; color <= GREEN; color++) {
        deck.push({ color: color, type: N0 });

        for (let type = N1; type <= SKIP; type++) {
            deck.push({ color: color, type: type });
            deck.push({ color: color, type: type });
        }

        deck.push({ color: WILD, type: CHOOSE });
        deck.push({ color: WILD, type: PLUS_4 });
    }

    return deck;
}

function startCardGame(roomState) {
    roomState.deck = shuffleDeck(createDeck());
    roomState.safe.topCard = roomState.deck[roomState.deck.length - 1];

    roomState.playerHands = {};
    
    for (let player of Object.keys(roomState.safe.players)) {
        for (let i = 0; i < 7; i++) {
            const hand = roomState.deck.splice(-7)
            roomState.playerHands[player] = hand;
        }
    }

    for (let playerID of Object.keys(roomState.playerHands)) {
        console.log(playerID);
        console.log(roomState.playerHands[playerID]);
    }
}