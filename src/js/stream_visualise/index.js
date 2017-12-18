import { HOWLER, SPARKY, FLUFFY } from './../common/_constants';
import { Howl } from 'howler';
import spriteData from './../../data/magicSounds.json';
import Sparky from './_sparky';
import Fluffy from './_fluffy';

// Define the types of visualisation's object
const objectsToVisualise = {
  sparky: new Sparky(),
  fluffy: new Fluffy()
};

class SoundController {
  constructor() {
    this.tracks = {
      path: '../../data/audio/',
      data: spriteData
    };
    this.visualisation;
  }
  // Get the spritemap from standart audiosprite JSON
  get _trackMap() {
    let mapObject = Object.assign(this.tracks.data.spritemap);
    for (const track in mapObject) {
      mapObject[track] = Object.values(mapObject[track]).splice(0, 2);
      mapObject[track].forEach(function(el, index, array) {
        if (array[index] !== 0) {
          array[index] = Math.floor(el * 1000);
        }
      });
    }

    return mapObject;
  }
  // Get the sources by concatinating JSON spritenam and path
  get _trackSrc() {
    let path = this.tracks.path;

    let spritesPathes = this.tracks.data.resources.map(src => {
      return (src = `${path}${src}`);
    });

    return spritesPathes;
  }

  init() {
    let self = this;
    // Create an instance of sound soundController as a wrapper of webAudio API
    const sound = new Howl({
      src: this._trackSrc,
      sprite: this._trackMap,
      volume: 0.5,
      ctx: true,
      html5: false,
      masterGain: true
    });

    sound.on('load', function(e) {
      // console.log(sound._sprite['aso']);
      // sound.play('mystery');

      if (SPARKY) {
        self.visualisation = objectsToVisualise.sparky;
      } else if (FLUFFY) {
        self.visualisation = objectsToVisualise.fluffy;
      } else {
        throw Error('You do not have any object to play with');
      }

      console.log(sound.ctx);
      let magic = self.visualisation;
      magic.run();
    });
  }
}

let soundController = new SoundController();

if (HOWLER) {
  soundController.init();
}
