const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" }});

app.use(express.static(`${__dirname}/../public`));

server.on('error', (err) => {
    console.error(err);
});

server.listen(9090, () => {
    console.log('Server is ready');
});

/**
 * Key: Room IDs
 * Value: State of that specific room
 * 
 * This will be a huge map that stores every state for every room, we might replace this with a database MAYBE idk we'll see
 */
const state = {};

/**
 * Key: Client IDs
 * Value: Room IDs
 * 
 * This maps every client to the ID of the current room they are in.
 * Useful for callbacks since you can get room info just from the client.
 */
const clientRooms = {};

/**
 * Constants
 */
const MAX_PLAYERS = 6;

const GAME_WAITING = 0;
const GAME_PLAYING = 1;
const GAME_OVER = -1;

/**
 * Everything in this function is defining callbacks for events triggered by the client, basically communication between browser and server
 * They all get defined when the 'connection' event gets called, which is when a browser connects by URL.
 */
io.on('connection', client => {

    console.log(io.sockets.adapter.rooms); // Debug code

    /**
     * Attaching callbacks to their respective events
     */
    client.on('createGame', handleCreateGame);
    client.on('joinGame', handleJoinGame);
    client.on('disconnect', handleDisconnect);
    client.on('startGame', handleStartGame);
    client.on('nextTurn', handleNextTurn);

    /**
     * Callback for when a client creates a new room
     * No parameters
     */
    function handleCreateGame() {

        let roomID = genID(6);
        clientRooms[client.id] = roomID;

        /**
         * Reinforms the client that just created a room about its ID.
         */
        client.emit('gameCode', roomID);

        const player = {
            id: client.id,
        }

        client.number = 0;

        state[roomID] = createBlankState();
        state[roomID].players.push(player);
        state[roomID].partyLeader = client.id;
        state[roomID].numPlayers = 1;


        /**
         * The client joins the room they created and we give it authorization to start the game at any point.
         */
        client.join(roomID);
        client.emit('joinSuccess', state[roomID].players);
        client.emit('giveStartAuth')
    }

    /**
     * Callback for when a client decides to join an existing room instead of creating one.
     * Takes in the requested room ID.
     */
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
        else if (state[roomID].gameStatus !== GAME_WAITING) {
            client.emit('gameAlreadyStarted', roomID);
            return;
        }

        clientRooms[client.id] = roomID;

        const player = {
            id: client.id
        }

        client.number = numClients;

        state[roomID].players.push(player);
        state[roomID].numPlayers++;

        /**
         * The client joins the room and we inform every other client about it.
         */
        client.join(roomID);
        client.emit('joinSuccess', state[roomID].players);
        client.broadcast.emit('playerJoined', player);
    }

    /**
     * Callback for when a client disconnects.
     * Takes in the reason for disconnection.
     */
    function handleDisconnect(reason) {
        const roomID = clientRooms[client.id];
        if (roomID) {
            io.emit('playerLeft', state[roomID].players[client.number]);
            state[roomID].numPlayers--;
            state[roomID].players[client.number] = null;

            delete clientRooms[client.id];
            console.log(io.sockets.adapter.rooms);
        }
    }

    /**
     * Callback for when the party leader starts the game.
     * No parameters.
     */
    function handleStartGame() {
        const roomID = clientRooms[client.id];

        /**
         * We have to prevent any client-side manipulation so we double-check if the client that called this truly is the party leader.
         */
        if (state[roomID].partyLeader === client.id) {
            console.log("Starting game...");

            state[roomID].gameStatus = GAME_PLAYING;
            startCardGame(roomID);

            const {playerHands, deck, ...safeState} = state[roomID];
            for (let player of state[roomID].players) {
                const playerClient = io.sockets.sockets.get(player.id);
                const tempHand = [
                    { color: YELLOW, type: N6 },
                    { color: YELLOW, type: N4 },
                    { color: RED, type: N2 },
                    { color: RED, type: PLUS_2 },
                    { color: GREEN, type: PLUS_2 },
                    { color: BLUE, type: N0 },
                    { color: BLUE, type: N9 },
                    { color: WILD, type: PLUS_4 },
                ];
                playerClient.emit('gameStarted', tempHand, safeState);
            }

            handleNextTurn(state[roomID].topCard);
        }
        else {
            console.log("Not authorized to start a game");
        }
    }

    function handleNextTurn(playedCard) {
        const roomID = clientRooms[client.id];
        const roomState = state[roomID];

        roomState.topCard = playedCard;

        switch (roomState.topCard.type) {
        case SKIP:
            nextPlayer(roomID);
            break;
        case REVERSE:
            roomState.turnDirection *= -1;
            break;
        case PLUS_2:
            break;
        case PLUS_4:
            break;
        case CHOOSE:
            break;
        default:
            break;
        }

        nextPlayer(roomID);
        const {playerHands, deck, ...safeState} = roomState;
        const currPlayerHand = playerHands[roomState.currPlayer.id];

        const startingClient = io.sockets.sockets.get(roomState.currPlayer.id);

        startingClient.emit('onPlayTurn', currPlayerHand, safeState);
        startingClient.broadcast.emit('onOtherPlayerTurn', roomState.currPlayer);
    }
});

function nextPlayer(roomID) {
    const roomState = state[roomID];
    if (roomState.currPlayer === null) {
        roomState.currPlayerIndex = Math.floor(Math.random() * roomState.numPlayers);
        roomState.currPlayer = roomState.players[roomState.currPlayerIndex];
        return;
    }
    
    do {
        roomState.currPlayerIndex += roomState.turnDirection;
        if (roomState.currPlayerIndex >= roomState.numPlayers) {
            roomState.currPlayerIndex = 0;
        }
        else if (roomState.currPlayerIndex < 0) {
            roomState.currPlayerIndex = roomState.numPlayers - 1;
        }

        roomState.currPlayer = roomState.players[roomState.currPlayerIndex];
    } while (roomState.currPlayer);
}

function createBlankState() {
    const state = {
        gameStatus: GAME_WAITING,
        playerHands: {

        },
        players: [

        ],
        numPlayers: 0,
        partyLeader: null,

        turnDirection: 1,
        currPlayerIndex: 0,
        currPlayer: null,

        deck: null,
        topCard: null,
        discarded: [],
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

function startCardGame(roomID) {
    const roomState = state[roomID];
    roomState.deck = shuffleDeck(createDeck());
    
    for (let player of roomState.players) {
        for (let i = 0; i < 8; i++) {
            const hand = roomState.deck.splice(-8)
            roomState.playerHands[player.id] = hand;
        }
    }
    roomState.discarded.push(roomState.deck.pop());
    roomState.topCard = roomState.discarded[roomState.discarded.length - 1];
}