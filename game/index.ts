import { initializeGame } from './game';
import { playTurn } from './interface';

const game = initializeGame(2);
await playTurn(game);

// console.log(game);
