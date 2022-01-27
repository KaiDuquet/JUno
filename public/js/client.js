const playButton = document.getElementById("play-button");
const tutorialButton = document.getElementById("tutorial-button");
const backButton = document.getElementById("back-button");

const socket = io();

const displayStack = []

playButton.addEventListener("mouseenter", e => {
    tutorialButton.style.opacity = 0.5;
    playButton.style.opacity = 1;
});
playButton.addEventListener("mouseleave", e => {
    tutorialButton.style.opacity = 0.8;
    playButton.style.opacity = 0.8;
});

tutorialButton.addEventListener("mouseenter", e => {
    tutorialButton.style.opacity = 1;
    playButton.style.opacity = 0.5;
});
tutorialButton.addEventListener("mouseleave", e => {
    tutorialButton.style.opacity = 0.8;
    playButton.style.opacity = 0.8;
});

playButton.addEventListener('click', onPlayClicked);
tutorialButton.addEventListener('click', onHowToPlayClicked);
backButton.addEventListener('click', onBackClicked);

function onPlayClicked() {
    if (!displayStack.length) {
        const mainMenu = document.getElementById("main-menu");
        displayStack.push(mainMenu);
    }
    const roomForm = document.querySelector(".room-form-container");
    
    displayStack.push(roomForm);
    transition(displayStack[0], roomForm);
}

function onHowToPlayClicked() {
    alert("Tutorial coming soon");
}

function onBackClicked() {
    const current = displayStack.pop();
    transition(current, displayStack[0]);
}

function transition(oldDisplay, newDisplay) {
    oldDisplay.setAttribute("style", "display: none;");
    newDisplay.setAttribute("style", "display: block;");
}


// Form

const createGameButton = document.getElementById("create-button");
const joinGameButton = document.getElementById("join-button");
createGameButton.addEventListener('click', onCreateGameClicked);
joinGameButton.addEventListener('click', onJoinGameClicked);

const lobbyDisplay = document.querySelector(".lobby-container");

function onCreateGameClicked() {
    displayStack.push(lobbyDisplay);
    transition(displayStack[1], lobbyDisplay);
    
    socket.emit('createGame');
}

function onJoinGameClicked() {
    const gameCodeInput = document.getElementById('room-code').value;
    if (!(/^[a-z0-9]{6}$/i.test(gameCodeInput))) {
        document.getElementById('room-code').value = "Invalid Game Code";
        return false;
    }
    socket.emit('joinGame', gameCodeInput);
}

// ----- SOCKET.IO RELATED CODE -----

socket.on('playerJoined', handlePlayerJoined);
socket.on('gameCode', displayGameCode);
socket.on('joinSuccess', onJoinSuccess);
socket.on('playerLeft', handlePlayerLeft);

const playerList = {}
const listElement = document.querySelector(".player-list");

function onJoinSuccess(players) {
    displayStack.push(lobbyDisplay);
    transition(displayStack[1], lobbyDisplay);
    
    for (let player of Object.keys(players)) {
        let newPlayerLabel = document.createElement('li');
        newPlayerLabel.appendChild(document.createTextNode('Player ' + players[player].playerID));
        listElement.appendChild(newPlayerLabel);
        playerList[players[player].playerID] = [players[player], newPlayerLabel];
    }
}

function handlePlayerJoined(player) {
    let newPlayerLabel = document.createElement('li');
    newPlayerLabel.appendChild(document.createTextNode('Player ' + player.playerID));
    listElement.appendChild(newPlayerLabel);
    playerList[player.playerID] = [player, newPlayerLabel];
}

function handlePlayerLeft(player) {
    console.log(player);
    playerList[player.playerID][1].parentNode.removeChild(playerList[player.playerID][1]);
    delete playerList[player.playerID];
}

function displayGameCode(gameCode) {
    let gameCodeLabel = document.createElement('h1');
    gameCodeLabel.appendChild(document.createTextNode('Game Code: ' + gameCode));
    lobbyDisplay.appendChild(gameCodeLabel);
}

// Room errors

socket.on('gameNotFound', gameCode => {
    alert(`Room ${gameCode} does not exist`);
});
socket.on('roomAlreadyFull', gameCode => {
    alert(`Room ${gameCode} is already full`);
});
