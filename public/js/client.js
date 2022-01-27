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

playButton.onclick = onPlayClicked;
tutorialButton.onclick = onHowToPlayClicked;
backButton.onclick = onBackClicked;

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
createGameButton.onclick = onCreateGameClicked;
joinGameButton.onclick = onJoinGameClicked;

function onCreateGameClicked() {
    const lobbyDisplay = document.querySelector(".lobby-container");
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

socket.on('gameNotFound', handleGameNotFound);
socket.on('roomAlreadyFull', handleRoomFull);

function onJoinSuccess(players) {
    const lobbyDisplay = document.querySelector(".lobby-container");
    displayStack.push(lobbyDisplay);
    transition(displayStack[1], lobbyDisplay);
    
    const playerList = document.querySelector(".player-list");
    for (let player of players) {
        let newPlayerLabel = document.createElement('li');
        newPlayerLabel.appendChild(document.createTextNode('Player ' + player.playerID));
        playerList.appendChild(newPlayerLabel);
    }
}

function handlePlayerJoined(player) {
    console.log(player);
    const playerList = document.querySelector(".player-list");
    let newPlayerLabel = document.createElement('li');
    newPlayerLabel.appendChild(document.createTextNode('Player ' + player.playerID));
    playerList.appendChild(newPlayerLabel);
}

function displayGameCode(gameCode) {
    const lobbyContainer = document.querySelector(".lobby-container");
    let gameCodeLabel = document.createElement('h1');
    gameCodeLabel.appendChild(document.createTextNode('Game Code: ' + gameCode));
    lobbyContainer.appendChild(gameCodeLabel);
}

function handleGameNotFound(gameCode) {
    alert(`Room ${gameCode} does not exist`);
}

function handleRoomFull(gameCode) {
    alert(`Room ${gameCode} is already full`);
}