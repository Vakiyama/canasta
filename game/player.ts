import {
    Set,
    Card,
} from './cards';
import { type Game } from './game';

export type Player = {
    sets: Set[],
    hand: Card[],
    beat: boolean,
}

export function purchaseFromPile({ pile, currentTurn, players }: Game) {
    const card = pile.splice(0, 1)[0];
    players[currentTurn].hand.push(card)
    return card;
}

export function purchaseFromJunkyard({ junkyard, currentTurn, players }: Game) {
    const player = players[currentTurn];
    player.hand = [...player.hand, ...junkyard];
    junkyard = [];
}


export function isValidSet(set: Set) {
    const cards = set.cards;
    let joker = false;
    let previousValue = cards[0].value;
    const suit = cards[0].suit;
    for (const card of cards) {
        if (card.suit !== suit && card.suit !== null) return false; // invalid suit
        if (card.value !== previousValue) { // either a valid joker or out of order set
            if (previousValue === 13 && card.value === 1) continue; // ace can go after king
            if (
                card.value === "joker" && joker || // two jokers
                card.value === 2 && previousValue !== 1 && joker || // out of order 2 and a joker
                card.value !== 2 && card.value !== "joker" // not a joker, just out of order
            ) { return false } else joker = true; // invalid set or uses a joker
        }
    }
    return true;
}

function isSameCard(cardA: Card, cardB: Card) {
    return cardA.value === cardB.value && cardA.suit === cardB.suit;
}

function removeCard(card: Card, player: Player) {
    const handCardIndex = player.hand.findIndex((handCard) => {
        return isSameCard(card, handCard)
    });
    player.hand.splice(handCardIndex, 1);
}

/**
    * If valid set, moves cards in newSet to players sets from their hand
    * @param newSet a copy of the set to be lowered
*/
export function lowerSet(
    { players, currentTurn }: Game,
    newSet: Set,
) {
    const player = players[currentTurn];
    if (!isValidSet(newSet)) throw new Error('Invalid set');
    for (const card of newSet.cards) removeCard(card, player);
    player.sets.push(newSet);
}

// modify an existing set
export function addToSet(
    { currentTurn, players }: Game,
    oldSetIndex: number,
    newSet: Set,
    removedCards: Card[],
) {
    if (!isValidSet(newSet)) throw new Error('Invalid set');
    const player = players[currentTurn];
    
    player.hand = player.hand.filter(card => {
        const index = removedCards.findIndex(cardToRemove => {
            return isSameCard(card, cardToRemove);
        })
        if (index !== -1) {
            removedCards.splice(index, 1);
            return true;
        }
    })

    player.sets[oldSetIndex] = newSet;
}

export function addToJunkyard({ currentTurn, players, junkyard }: Game, indexOfCard: number) {
    const player = players[currentTurn];
    const card = player.hand.splice(indexOfCard, 1)[0];
    junkyard.push(card);
}
