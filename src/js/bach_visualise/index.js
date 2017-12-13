import './../common/_changelog';
import Player from './_Player';
import { BACH } from './../common/_constants';

if (BACH) {
  let player = new Player('bach');
  player.run();
}
