import { HOWLER } from './../common/_constants';
import { Howl } from 'howler';

import './../server/index';

class SoundHowl {
  constructor() {
    this.tracks = {
      zero: { path: '../data/audio/aso.mp3', sound: [] },
      first: { path: '../data/audio/mystery.mp3', sound: [] }
    };
  }

  run() {
    let self = this;
    const sound = new Howl({
      src: [self.tracks.zero.path, self.tracks.first.path],
      preload: true
    });

    sound.on('load', function(e) {
      console.log(sound);
    });
  }
}

let soundController = new SoundHowl();

if (HOWLER) {
  soundController.run();
}
