const playButton = document.getElementById("play-button");
const tutorialButton = document.getElementById("tutorial-button");
const backButton = document.getElementById("back-button");

const socket = io();

const displayStack = []

// Main Menu buttons

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

playButton.addEventListener('click', e => {
    if (!displayStack.length) {
        const mainMenu = document.getElementById("main-menu");
        displayStack.push(mainMenu);
    }
    const roomForm = document.querySelector(".room-form-container");
    
    transition(roomForm);
});

tutorialButton.addEventListener('click', e => {
    alert("Tutorial coming soon")
});

backButton.addEventListener('click', e => {
    transition('');
});

function transition(display) {
    if (display === "") {
        displayStack.pop().setAttribute("style", "display: none;");
        displayStack[displayStack.length - 1].setAttribute("style", "display: block;");
    }
    else {
        displayStack.push(display);
        displayStack[displayStack.length - 2].setAttribute("style", "display: none;");
        display.setAttribute("style", "display: block;");
    }
}


// Form

const createGameButton = document.getElementById("create-button");
const joinGameButton = document.getElementById("join-button");
const startGameButton = document.getElementById("start-button");

const lobbyDisplay = document.querySelector(".lobby-container");

createGameButton.addEventListener('click', e => {
    transition(lobbyDisplay);
    
    socket.emit('createGame');
});

joinGameButton.addEventListener('click', e => {
    const gameCodeInput = document.getElementById('room-code').value;
    if (!(/^[a-z0-9]{6}$/i.test(gameCodeInput))) {
        document.getElementById('room-code').value = "Invalid Game Code";
        return false;
    }
    socket.emit('joinGame', gameCodeInput);
});

startGameButton.addEventListener('click', e => {
    socket.emit('startGame');
});

// ----- SOCKET.IO RELATED CODE -----

socket.on('playerJoined', handlePlayerJoined);
socket.on('gameCode', displayGameCode);
socket.on('joinSuccess', onJoinSuccess);
socket.on('playerLeft', handlePlayerLeft);

socket.on('giveStartAuth', () => {
    startGameButton.classList.remove('disabled');
    startGameButton.disabled = false;
});

const playerList = {}
const listElement = document.querySelector(".player-list");

function onJoinSuccess(players) {
    transition(lobbyDisplay);
    
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
    document.querySelector(".game-code-container").appendChild(gameCodeLabel);
}

// Room errors

socket.on('gameNotFound', gameCode => {
    alert(`Room ${gameCode} does not exist`);
});
socket.on('roomAlreadyFull', gameCode => {
    alert(`Room ${gameCode} is already full`);
});

// Game code

socket.on('gameStarted', () => {
    transition(document.querySelector('.game-root'));
});

function onPlayTurn(state) {

}