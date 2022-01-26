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

const newGame = (numPlayers) => {

    const state = {
        
    }
}