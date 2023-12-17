export type Suit = "clubs" | "hearts" | "spades" | "diamonds";

export type Card = {
    suit: Suit | null,
    value: number | "joker", // 1 is Ace, 11 12 13 - is Jack, Queen, King
}

// this assumes cards is a valid set (no duplicates other than ace, correct order)
// should be checked on input
export type Set = {
    cards: Card[],
    dirty: boolean,
}

function getCardValue(card: Card): number {
    if (card.value === "joker") return 50;
    if (card.value === 2) return 20; // dirty joker
    if (card.value === 1) return 15;
    if (card.value > 7) return 10;
    return 5;
}

function getSpecialSetValue(set: Set): number {
    let value = 0;
    if (set.cards.length > 6) value = 200;
    if (set.cards.length === 14) value = 1000;
    if (set.dirty) value /= 2;
    return value;
}

export function getSetValue(set: Set): number {
    let value = getCardsValue(set.cards);
    value += getSpecialSetValue(set);
    return value;
}

export function getCardsValue(cards: Card[]): number {
    return cards.reduce((acc, card) => acc + getCardValue(card), 0); 
}
