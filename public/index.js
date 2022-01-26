const playButton = document.getElementById("play-button");
const tutorialButton = document.getElementById("tutorial-button");
const backButton = document.getElementById("back-button");

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