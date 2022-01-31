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
    
    for (let player of players) {
        let newPlayerLabel = document.createElement('li');
        newPlayerLabel.appendChild(document.createTextNode('Player ' + player.id));
        listElement.appendChild(newPlayerLabel);
        playerList[player.id] = [player, newPlayerLabel];
    }
}

function handlePlayerJoined(player) {
    let newPlayerLabel = document.createElement('li');
    newPlayerLabel.appendChild(document.createTextNode('Player ' + player.id));
    listElement.appendChild(newPlayerLabel);
    playerList[player.id] = [player, newPlayerLabel];
}

function handlePlayerLeft(player) {
    console.log(player);
    playerList[player.id][1].parentNode.removeChild(playerList[player.id][1]);
    delete playerList[player.id];
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
socket.on('gameAlreadyStarted', gameCode => {
    alert(`Room ${gameCode} has already started`);
});

// Game code
const renderer = PIXI.autoDetectRenderer({width: window.innerWidth, height: window.innerHeight});
renderer.backgroundColor = 0xFFFFFF;
const loader = PIXI.Loader.shared;
document.querySelector('.game-root').appendChild(renderer.view);

/*for (let i = 0; i < 10; i++) {
    loader.add(`0-${i}`, `../img/red/r${i}.png`);
}
for (let i = 0; i < 10; i++) {
    loader.add(`1-${i}`, `../img/yellow/y${i}.png`);
}
for (let i = 0; i < 10; i++) {
    loader.add(`2-${i}`, `../img/blue/b${i}.png`);
}
for (let i = 0; i < 10; i++) {
    loader.add(`3-${i}`, `../img/green/g${i}.png`);
}

loader
    /*.add('back', '../img/back.png')
    .add('4-13', '../img/special/change.png')
    .add('4-14', '../img/special/plus4.png')

    .add('0-10', '../img/red/r22.png')
    .add('1-10', '../img/yellow/y22.png')
    .add('2-10', '../img/blue/b22.png')
    .add('3-10', '../img/green/g22.png')

    .add('0-11', '../img/red/rr.png')
    .add('1-11', '../img/yellow/yr.png')
    .add('2-11', '../img/blue/br.png')
    .add('3-11', '../img/green/gr.png')

    .add('0-12', '../img/red/rd.png')
    .add('1-12', '../img/yellow/yd.png')
    .add('2-12', '../img/blue/bd.png')
    .add('3-12', '../img/green/gd.png').load();*/
loader
    .add('1-6', '../img/test/t1.png')
    .add('0-2', '../img/test/t3.png')
    .add('0-10', '../img/test/t4.png')
    .add('3-10', '../img/test/t5.png')

    .add('2-0', '../img/test/t6.png')
    .add('2-9', '../img/test/t7.png')
    .add('1-4', '../img/test/t2.png')
    .add('4-14', '../img/test/t8.png').load();


/*const cardSpriteMap = {};
function setup(loader, resources) {
    for (let i = 0; i < 10; i++) {
        cardSpriteMap[`0-${i}`] = new PIXI.Sprite(resources[`r${i}`].texture);
    }
    for (let i = 0; i < 10; i++) {
        cardSpriteMap[`1-${i}`] = new PIXI.Sprite(resources[`y${i}`].texture);
    }
    for (let i = 0; i < 10; i++) {
        cardSpriteMap[`2-${i}`] = new PIXI.Sprite(resources[`b${i}`].texture);
    }
    for (let i = 0; i < 10; i++) {
        cardSpriteMap[`3-${i}`] = new PIXI.Sprite(resources[`g${i}`].texture);
    }

    cardSpriteMap['0-10'] = new PIXI.Sprite(resources['r22'].texture);
    cardSpriteMap['1-10'] = new PIXI.Sprite(resources['y22'].texture);
    cardSpriteMap['2-10'] = new PIXI.Sprite(resources['b22'].texture);
    cardSpriteMap['3-10'] = new PIXI.Sprite(resources['g22'].texture);
    
    cardSpriteMap['0-11'] = new PIXI.Sprite(resources['rr'].texture);
    cardSpriteMap['1-11'] = new PIXI.Sprite(resources['yr'].texture);
    cardSpriteMap['2-11'] = new PIXI.Sprite(resources['br'].texture);
    cardSpriteMap['3-11'] = new PIXI.Sprite(resources['gr'].texture);
    
    cardSpriteMap['0-12'] = new PIXI.Sprite(resources['rd'].texture);
    cardSpriteMap['1-12'] = new PIXI.Sprite(resources['yd'].texture);
    cardSpriteMap['2-12'] = new PIXI.Sprite(resources['bd'].texture);
    cardSpriteMap['3-12'] = new PIXI.Sprite(resources['gd'].texture);
    
    cardSpriteMap['back'] = new PIXI.Sprite(resources['back'].texture);
    cardSpriteMap['4-13'] = new PIXI.Sprite(resources['change'].texture);
    cardSpriteMap['4-14'] = new PIXI.Sprite(resources['plus4'].texture);
}*/

const stage = new PIXI.Container();

socket.on('gameStarted', (hand, gameState) => {
    transition(document.querySelector('.game-root'));

    for (let i = 0; i < hand.length; i++) {
        const card = hand[i];
        const sprite = new PIXI.Sprite(loader.resources[`${card.color}-${card.type}`].texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(0.25, 0.25);
        sprite.position.x = innerWidth / 2 + (i - hand.length / 2) * 50;
        sprite.position.y = innerHeight - 250;
        stage.addChild(sprite);
    }

    renderer.render(stage);
});

socket.on('onOtherPlayerTurn', currPlayer => {
    console.log(currPlayer);
});

socket.on('onPlayTurn', (hand, gameState) => {
    console.log(gameState.topCard);
    console.log(hand);
});