import { HOWLER, SPARKY, FLUFFY } from './../common/_constants';
import { Howl } from 'howler';
import spriteData from './../../data/magicSounds.json';
import Sparky from './_sparky';
import Fluffy from './_fluffy';

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
  get _trackMap() {
    let mapObject = Object.assign(this.tracks.data.spritemap);

    // let result=[];

    for (const track in mapObject) {
      mapObject[track] = Object.values(mapObject[track]).splice(0, 2);
      mapObject[track].forEach(function(el, index, array) {
        array[index] = Math.floor(el);
      });
    }

    return mapObject;
  }

  get _trackSrc() {
    let path = this.tracks.path;

    let spritesPathes = this.tracks.data.resources.map(src => {
      return (src = `${path}${src}`);
    });

    return spritesPathes;
  }

  init() {
    let self = this;

    const sound = new Howl({
      src: this._trackSrc,
      sprite: this._trackMap
    });

    sound.on('load', function(e) {
      console.log(sound._sprite);
      sound.play();
      if (SPARKY) self.visualisation = objectsToVisualise.sparky;
      else if (FLUFFY) self.visualisation = objectsToVisualise.fluffy;
      else throw Error('You do not have any object to play with');

      let magic = self.visualisation;
      magic.run();
      // console.log(magic);
    });
  }
}

let soundController = new SoundController();

if (HOWLER) {
  soundController.init();
}
