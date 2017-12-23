import { SPARKY, FLUFFY, PLAY, STOP } from './../common/_constants';
import Sparky from './_sparky';
import Fluffy from './_fluffy';

let AudioVisualisation;
if (SPARKY) AudioVisualisation = new Sparky();
else if (FLUFFY) AudioVisualisation = new Fluffy();
else throw Error('Hey,fella,define some visualisation');

AudioVisualisation.init();

AudioVisualisation.setupAudioProccesing();

PLAY.addEventListener('click', function(e) {
  AudioVisualisation.playDefaultSound();
});
STOP.addEventListener('click', function(e) {
  AudioVisualisation.stopSound();
});
