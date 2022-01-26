const Application = PIXI.Application;

const app = new Application({
    width: 1280,
    height: 860,
    backgroundAlpha: 0.5,
    antialias: true,
});

app.renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);

