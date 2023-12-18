import {
    type Card,
    type Suit,
} from './cards';
import {
    type Player,
} from './player';

export type Game = {
    morto: Card[][],
    pile: Card[],
    junkyard: Card[],
    players: Player[], // only support 2 players for now
    currentTurn: number, 
}

function generateRandomInteger(max: number) {
    return Math.floor(Math.random() * max);
}

function generateCardsWithSuit(suit: Suit) {
    const cards = [];
    for (let cardValue = 1; cardValue < 14; cardValue++) {
        const card: Card = { suit, value: cardValue };
        cards.push(card);
    }
    return cards;
}

function generateStartingDeck(): Card[] {
    let deck: Card[] = [];
    const suits = ["clubs", "hearts", "spades", "diamonds"] as const;
    for (const suit of suits) {
        const cards = generateCardsWithSuit(suit);
        deck = [...deck, ...cards]
    }

    const joker = {
        suit: null,
        value: "joker",
    } as const;

    deck.push({...joker});
    deck.push(joker);

    return deck;
}

function shuffleInPlace(cards: Card[], shuffleCount: number): void {
    if (shuffleCount === 0) return;

    for (let i = 0; i < cards.length; i++) {
        const currentCard = cards[i];
        const swapIndex = generateRandomInteger(cards.length);
        const cardToSwap = cards[swapIndex];

        cards[i] = cardToSwap;
        cards[swapIndex] = currentCard;
    }
    
    return shuffleInPlace(cards, shuffleCount - 1);
}

function getSuitValue(suit: Suit | null): number {
    switch (suit) {
        case 'clubs':
            return 1;
        case 'hearts':
            return 2;
        case 'spades':
            return 3;
        case 'diamonds':
            return 4;
        default:
            return 0;
    }
}

export function sortCardsInPlace(cards: Card[]): void {
    cards.sort((a, b) => {
        if (a.value === 'joker' || b.value === 'joker') return 0;
        return a.value - b.value;
    })
    cards.sort((a, b) => {
        return getSuitValue(a.suit) - getSuitValue(b.suit);
    })
}

function populatePlayers(deck: Card[], playerCount: number): Player[] {
    if (playerCount < 2 || playerCount > 4) throw new Error('Invalid Player Count, outside of 2-4 player range');
    const players: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
        const player: Player = {
            sets: [],
            hand: deck.splice(0, 11),
            beat: false,
        }
        sortCardsInPlace(player.hand);
        players.push(player);
    }
    return players;
}

export function initializeGame(playerCount: number) {
    const startingDeck = generateStartingDeck();
    const deck = [...startingDeck, ...startingDeck];
    shuffleInPlace(deck, 100);
    const morto = [deck.splice(0, 11), deck.splice(0, 11)];
    morto.map(cards => { sortCardsInPlace(cards)})
    const players = populatePlayers(deck, playerCount);
    const game: Game = {
        morto,
        players,
        junkyard: [],
        pile: deck,
        currentTurn: generateRandomInteger(playerCount)
    };

    return game;
}
