import PubSub from 'pubsub-js';
import  {getArrayWithLimitedLength} from './lib/helpers';



class WebAudioAPISoundManager {

  constructor() {

    this._checkForSupport();
    this.context = context;
    this.bufferList = {};
    this.playingSounds = {};

    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.audioContext = new window.AudioContext();
    } catch (e) {
      console.log('No Web Audio API support');
    }


  }

  _addSound() {

    // Load buffer asynchronously
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    let self = this;

    request.onload = function() {

      // Asynchronously decode the
      // audio file data in request.response
      self.context.decodeAudioData(
        request.response,

        function(buffer) {
          if (!buffer) {
            console.log('error decoding file data: ' + url);
            return;
          }
          self.bufferList[url] = buffer;
        });
    };

    request.onerror = function() {
      console.log('BufferLoader: XHR error');
    };

    request.send();
  }

  _stopSoundWithUrl() {

    if(this.playingSounds.hasOwnProperty(url)) {
      for (let i in this.playingSounds[url]) {
        if (this.playingSounds[url].hasOwnProperty(i)) {
          this.playingSounds[url][i].stop();
        }
      }
    }

  }




}


class WebAudioAPISound {

  constructor() {

    this.url = url + '.mp3';
    window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
    this.manager = window.webAudioAPISoundManager;
    this.manager.addSound(this.url);

  }

  _play(options) {

    var buffer = this.manager.bufferList[this.url];

    this.settings = {
      loop: true,
      volume: 0.1
    };

    for(var i in options) {
      if (options.hasOwnProperty(i)) {
        this.settings[i] = options[i];
      }
    }

    //Only play if it's loaded yet
    if (typeof buffer !== 'undefined') {
      let source = this.makeSource(buffer);
      source.loop = this.settings.loop;
      source.start(0);

      if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
        this.manager.playingSounds[this.url] = [];
      }
      this.manager.playingSounds[this.url].push(source);
    }
  }

  _stop() {
    this.manager.stopSoundWithUrl(this.url);
  }

  _makeSource(buffer) {
  // console.log(this);
    let source = this.manager.context.createBufferSource();
    let gainNode = this.manager.context.createGain();
    let analyser = this.analyser(this);
    gainNode.gain.value = this.settings.volume;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(this.manager.context.destination);
    return source;
  }

  _changeVolume(element) {
    // console.log(element);
    let volume = element.value;
    let fraction = parseInt(element.value) / parseInt(element.max);
    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.
    this.gainNode.gain.value = fraction * fraction;
  }

  _analyser(buffer) {


    let analyser = this.manager.context.createAnalyser();

    // console.log(analyser);

    analyser.fftSize = 256;

    let bufferLength = analyser.frequencyBinCount;
    // console.log(bufferLength);
    let frequencyData = new Uint8Array(bufferLength);


    analyser.getByteTimeDomainData(frequencyData);


    return analyser;



  }



}





