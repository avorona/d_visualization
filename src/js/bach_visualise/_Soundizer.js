import WebAudioAPISoundManager from './_SoundManager';
import { getArrayWithLimitedLength } from './../lib/helpers';

export default class WebAudioAPISound {
  constructor(url) {
    this.url = url + '.mp3';
    window.webAudioAPISoundManager =
      window.webAudioAPISoundManager || new WebAudioAPISoundManager(this.url);
    this.manager = window.webAudioAPISoundManager;

    this._createCanvas();
    // console.log(dat);
    this.manager._addSound(this.url);
  }

  play(options) {
    let url = this.url;

    let buffer = this.manager.bufferList[url];
    // console.log(buffer);
    this.settings = {
      loop: true,
      volume: 0.5
    };

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
    this.soundAnalyser = analyser;
    gainNode.gain.value = this.settings.volume;
    this.GainNode = gainNode;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(this.manager.context.destination);
    // console.log(gainNode.gain.value);
    return source;
  }

  changeVolume(element) {
    // console.log(element);
    let fraction = parseInt(element.value) / parseInt(element.max);
    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.

    this.GainNode.gain.value = fraction * fraction;

    //rechain nodes
    this.soundAnalyser.connect(this.GainNode);
    this.GainNode.connect(this.manager.context.destination);
  }

  analyser() {
    let self = this;
    let analyser = this.manager.context.createAnalyser();
    analyser.fftSize = 256;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);

    this.visualiser = {
      speed: 100,
      diameter: 100
    };

    let time = 1;

    function render(data) {
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
            (self.visualiser.diameter + f) *
              Math.sin(
                f *
                  10 *
                  2 *
                  Math.PI /
                  self.visualiser.speed *
                  (clock * time / 100)
              );
          let y =
            300 +
            (self.visualiser.diameter + f) *
              Math.cos(
                f *
                  10 *
                  2 *
                  Math.PI /
                  self.visualiser.speed *
                  (clock * time / 100)
              );

          canvasCtx.lineTo(x, y);
        });
        canvasCtx.stroke();
      });

      canvasCtx.closePath();

      canvasCtx.strokeStyle = '#aaf411';
      // canvasCtx.stroke();
    }

    draw();

    function draw() {
      window.requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);
      render(dataArray);
    }

    return analyser;
  }

  _createCanvas() {
    this._canvas = document.getElementById('canvas');
    this._canvas.width = 600;
    this._canvas.height = 600;
    this._WIDTH = this._canvas.width;
    this._HEIGHT = this._canvas.height;
    this._canvasCtx = this._canvas.getContext('2d');

    this._canvasCtx.fillStyle = '#333333';
    this._canvasCtx.fillRect(0, 0, this._WIDTH, this._HEIGHT);
    // this._draw(this.analyser, this.Data);
  }
}
