import readline from 'node:readline/promises';
import { stdin } from 'node:process';
import {
    sortCardsInPlace,
    type Game 
} from './game';
import { EOL } from 'os';
import { Card, Suit } from './cards';
import { 
    Player,
    addToJunkyard,
    purchaseFromJunkyard, purchaseFromPile
} from './player';
import { sleep } from 'bun';

const rl = readline.createInterface({ input: stdin });
const gameSpeed = 2000;

function getSuitIcon(suit: Suit | null): string {
    switch (suit) {
        case 'clubs':
            return '♠';
        case 'hearts':
            return '♥';
        case 'spades':
            return '♣';
        case 'diamonds':
            return '♦';
        case null:
            return '🃏';
        
    }
}

function getCardName(value: number | 'joker') {
    if (value === 1) return 'A';
    if (value === 'joker') return 'Joker';
    if (value < 11) return value;
    switch (value) {
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
    }
}

function formatCard(card: Card) {
    const cardName = getCardName(card.value);
    const suitIcon = getSuitIcon(card.suit);
    return `${cardName}${suitIcon}`;
}

function formatCards(cards: Card[], separator: string) {
    return cards.map(formatCard).join(separator);
}

function makePilePurchase(game: Game) {
    const card = purchaseFromPile(game); 
    const cardFormatted = formatCard(card);
    console.log(`You purchased a ${cardFormatted}!`);
}

async function playPurchase(game: Game, player: Player) {
    console.log(`Player ${game.currentTurn + 1}'s turn!${EOL}`);
    console.log("Your hand:");
    console.log(formatCards(player.hand, ", ") + EOL);
    console.log(player.sets.length ? "Your sets:" + EOL : "No sets in play...");
    player.sets.map((set, index) => {
        const formatted = formatCards(set.cards, ", ");
        console.log(`Set ${index}:${EOL}${formatted}`);
    });
    if (game.junkyard.length > 0) {
        console.log('Junkyard:');
        console.log(formatCards(game.junkyard, ", "));
        let validAnswer = false;
        let answer = null;
        while (!validAnswer) {
            console.log("You can either purchase a random card from the pile or purchase all cards from the junkyard.");
            console.log("Please input p for pile or j for junkyard...");
            answer = await rl.question("");
            if (answer === "p" || answer === "j") validAnswer = true;
        }

        if (answer === "p") return makePilePurchase(game);
        purchaseFromJunkyard(game); 
    } else {
        console.log("Junkyard is empty..." + EOL);
        makePilePurchase(game);
        await sleep(gameSpeed);
        console.clear();
    }
}

async function selectCard(player: Player, prompt: string) {
    let validAnswer = false;
    let selection = 0;
    while (!validAnswer) {
    console.log(prompt);
    player.hand.map((card, index) => {
        const formattedCard = formatCard(card);
        console.log(`${index + 1}: ${formattedCard}`);
    })
        console.log("Make a selection by typing the number next to a card...");
        try {
            selection = parseInt(await rl.question(""));
            if (selection >= 0 && selection < player.hand.length + 1) validAnswer = true;
        } catch(e) {
            console.log("Invalid input, try again.");
        }
    }
    return selection;
}


async function playThrowAway(game: Game, player: Player) {
    const selection = await selectCard(player, "Throw away a card to end your turn!");
    const throwAwayCard = formatCard(player.hand[selection - 1]);
    console.log(`You threw away a ${throwAwayCard}!`);
    addToJunkyard(game, selection - 1);
    await sleep(gameSpeed);
    console.clear();
}

function endTurn(game: Game) {
    if (game.currentTurn === game.players.length - 1) return game.currentTurn = 0;
    return game.currentTurn++;
}

// TODO: implement this function
async function createNewSet(game: Game) {
}

// TODO: implement this function
async function addToSet(game: Game) {
}

async function playSets(game: Game) {
    let selection = "";
    let validInput = false;
    while (!validInput) {
        console.log("Would you like to create a set, or end your turn?");
        console.log("Enter e to end your turn or enter s create or extend your sets");
        selection = await rl.question("");
        if (selection !== "e" && selection !== "p") {
            console.log("Invalid input");
        } else validInput = true;
    }

    if (selection === "e") return;
    selection = "";
    validInput = false;

    while (!validInput) {
        console.log("Would you like to create or add to an existing set?");
        console.log("Enter c for create or a to add. Enter e to exit set creation and end your turn.");
        selection = await rl.question("");
        if (selection !== "e" && selection !== "c" && selection !== "e") {
            console.log("Invalid input");
        } else validInput = true;
    }

    if (selection === "e") return;
    if (selection === "c") await createNewSet(game);
    if (selection === "a") await addToSet(game);
}

export async function playTurn(game: Game) {
    const player = game.players[game.currentTurn];
    await playPurchase(game, player);
    sortCardsInPlace(player.hand);    
    console.log(`${EOL}Your new hand is ${formatCards(player.hand, ", ")}`);
    // skip making sets for now
    await playSets(game);
    await playThrowAway(game, player);
    endTurn(game);
    playTurn(game);
    // no end of game behavior yet
}

