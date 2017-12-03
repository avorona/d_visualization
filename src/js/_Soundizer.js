import PubSub from 'pubsub-js';
import WebAudioAPISoundManager from './_SoundManager';
import { getArrayWithLimitedLength } from './lib/helpers';
// import Visualiser from './_Visualizer';
// import Visualiser from './_Visualizer';

export default class WebAudioAPISound {
  constructor(url) {
    this.url = url + '.mp3';
    window.webAudioAPISoundManager =
      window.webAudioAPISoundManager || new WebAudioAPISoundManager(this.url);
    this.manager = window.webAudioAPISoundManager;
    this._canvas = document.getElementById('canvas');
    this._WIDTH = 800;
    this._HEIGHT = 800;
    this._canvasCtx = this._canvas.getContext('2d');
    this.manager._addSound(this.url);
  }

  play(options) {
    let url = this.url;

    let buffer = this.manager.bufferList[url];
    // console.log(buffer);
    this.settings = { loop: true, volume: 0.5 };

    for (var i in options) {
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

  stop() {
    this.manager.stopSoundWithUrl(this.url);
  }

  makeSource(buffer) {
    // console.log(this);
    let source = this.manager.context.createBufferSource();
    let gainNode = this.manager.context.createGain();
    let analyser = this.analyser();
    gainNode.gain.value = this.settings.volume;
    this.GainNode = this.manager.context.GainNode;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(this.manager.context.destination);
    // console.log(gainNode.gain.value);
    return source;
  }

  changeVolume(element) {
    // console.log(element);
    // let val = element.value;
    let fraction = parseInt(element.value) / parseInt(element.max);
    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.
    this.manager.context.GainNode = fraction * fraction;

    // console.log(this.manager.context.GainNode);
  }

  analyser() {
    let self = this;
    let analyser = this.manager.context.createAnalyser();
    analyser.fftSize = 256;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);

    this._createCanvas();

    draw();
    let time = 1;
    function draw() {
      window.requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);
      // analyser.getByteFrequencyData(dataArray);
      render(dataArray);
    }

    function render(data) {
      // console.log(data);
      time++;
      let canvasCtx = self._canvasCtx;
      let clock = -1;

      canvasCtx.clearRect(0, 0, self._WIDTH, self._WIDTH);

      // let clock = -1;
      var states = getArrayWithLimitedLength(300);

      states.push(data.slice(0));

      states.forEach((e, i, macro) => {
        canvasCtx.beginPath();
        e.forEach((f, ii, micro) => {
          // console.log(f);
          let x =
            300 +
            (100 + f) *
              Math.sin(f * 10 * 2 * Math.PI / 100 * (clock * time / 100));
          let y =
            300 +
            (100 + f) *
              Math.cos(f * 10 * 2 * Math.PI / 100 * (clock * time / 100));

          canvasCtx.lineTo(x, y);
        });
        canvasCtx.stroke();
      });

      canvasCtx.closePath();

      canvasCtx.strokeStyle = '#aaf411';
      // canvasCtx.stroke();
    }

    return analyser;
  }

  _createCanvas() {
    this._canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this._canvasCtx.fillRect(0, 0, this._WIDTH, this._HEIGHT);
    // this._draw(this.analyser, this.Data);
  }
}
