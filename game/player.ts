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
    const card = pile.splice(0, 1);
    players[currentTurn].hand.push(card[0])
}

export function purchaseFromJunkyard({ junkyard, currentTurn, players }: Game) {
    const currentPlayer = players[currentTurn];
    currentPlayer.hand = [...currentPlayer.hand, ...junkyard];
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

function removeCard(card: Card, currentPlayer: Player) {
    const handCardIndex = currentPlayer.hand.findIndex((handCard) => {
        return card.value === handCard.value &&
            card.suit === handCard.suit;
    });
    currentPlayer.hand.splice(handCardIndex, 1);
}


/**
    * If valid set, moves cards in newSet to players sets from their hand
    * @param newSet a copy of the set to be lowered
*/
export function lowerSet(
    { players, currentTurn }: Game,
    newSet: Set,
) {
    const currentPlayer = players[currentTurn];
    if (!isValidSet(newSet)) throw new Error('Invalid set');
    for (const card of newSet.cards) removeCard(card, currentPlayer);
    currentPlayer.sets.push(newSet);
}

function getDifferenceBetweenSets(
    setA: Set,
    setB: Set,
) {
    function getDifference(setA: Set, setB: Set) {
        for (const card of setA.cards) {}
    }
    
    if (setA.cards.length > setB.cards.length) {
        return getDifference(setA, setB);
    } else {
        return getDifference(setB, setA);
    }
}

// modify an existing set
export function addToSet(
    { currentTurn, players }: Game,
    oldSet: Set,
    newSet: Set,
) {
    if (!isValidSet(oldSet) || !isValidSet(newSet)) throw new Error('Invalid set');
    const currentPlayer = players[currentTurn];
    const cardsToRemove = getDifferenceBetweenSets(oldSet, newSet);     
}
