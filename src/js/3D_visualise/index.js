import { SPARKY, FLUFFY, PLAY, STOP, THREEJS } from './../common/_constants';
import Sparky from './_sparky';
import Fluffy from './_fluffy';

if (THREEJS) {
  let AudioVisualisation;
  if (SPARKY) AudioVisualisation = new Sparky();
  else if (FLUFFY) AudioVisualisation = new Fluffy();
  else console.log('Hey,fella,define some visualisation');

  AudioVisualisation.init();

  PLAY.addEventListener('click', function(e) {
    AudioVisualisation.audioProccesing();
  });
  STOP.addEventListener('click', function(e) {
    AudioVisualisation.sound.stop();
  });
}
