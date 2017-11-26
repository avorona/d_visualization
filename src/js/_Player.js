import PubSub from 'pubsub-js';
import WebAudioAPISoundManager from './_Soundizer';
import WebAudioAPISound from './_Soundizer';
import Visualiser from './_Visualizer';
import { PLAY,STOP,REGULATE} from './_constants';


console.log(PLAY, STOP, REGULATE);








var bach = new WebAudioAPISound('bach');
// console.log(bach);

// pagefeedSound.play({loop : false, volume : 0.8});

btnPlayAudio.addEventListener('click', function() {
  bach.play({ volume: 0 });
});

btnStopAudio.addEventListener('click', function() {
  bach.stop();
});

volumeRegulation.addEventListener('change', function() {

  bach.changeVolume(volumeRegulation);
});


// VolumeSample.toggle = function() {
//   this.playing ? this.stop() : this.play();
//   this.playing = !this.playing;
// };

