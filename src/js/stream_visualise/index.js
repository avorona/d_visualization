import { HOWLER } from './../common/_constants';
import { Howl } from 'howler';

class SoundHowl {
  constructor() {}

  run() {
    const sound = new Howl({ src: ['bach.mp3'] });
    sound.play();
  }
}

let soundController = new SoundHowl();

if (HOWLER) {
  soundController.run();
}
