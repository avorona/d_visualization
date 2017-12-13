import WebAudioAPISound from './_Soundizer';

import { PLAY, STOP, REGULATE } from './../common/_constants';

export default class Player {
  constructor(audio) {
    this.s = audio;
  }

  run() {
    let bach = new WebAudioAPISound(this.s);
    this.sound = bach;
    // console.log(bach);

    this._bindEvents();
  }

  _bindEvents() {
    this._bindClick();
  }

  _bindClick() {
    // pagefeedSound.play({loop : false, volume : 0.8});
    let self = this;

    PLAY.addEventListener('click', function() {
      // to prevent multiple threads
      self.sound.stop();
      self.sound.play({ loop: true, volume: 0.1 });
    });

    STOP.addEventListener('click', function() {
      self.sound.stop();
    });

    REGULATE.addEventListener('change', function() {
      self.sound.changeVolume(REGULATE);
    });

    // VolumeSample.toggle = function() {
    //   this.playing ? this.stop() : this.play();
    //   this.playing = !this.playing;
    // };
  }
}
