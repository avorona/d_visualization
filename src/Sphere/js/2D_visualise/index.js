import '../common/_changelog';
import Player from './_Player';
import { CANVAS2D } from '../common/_constants';

const trackPath = '../../data/audio/mystery';

if (CANVAS2D) {
  const player = new Player(trackPath);
  player.run();
}
