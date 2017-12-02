import PubSub from 'pubsub-js';

import { getArrayWithLimitedLength } from './lib/helpers';

export default class Visualiser {
  constructor() {
    this._canvas = document.getElementById('canvas');
    this._WIDTH = 800;
    this._HEIGHT = 800;
    this._canvasCtx = this._canvas.getContext('2d');

    this.Data = [];

    // this._init();
  }

  init() {
    this._createCanvas();
  }

  _createCanvas() {
    this._canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this._canvasCtx.fillRect(0, 0, this._WIDTH, this._HEIGHT);
    this._subscribeForData();
  }

  _subscribeForData() {
    let self = this;
    this._canvasCtx.clearRect(0, 0, this._WIDTH, this._HEIGHT);

    const topic = 'sound';

    PubSub.subscribe(topic, function(msg, d) {
      // console.log(d.operator);
      let analyser = d.operator;
      let data = d.data_fr;
      self._draw(analyser, data);
    });
  }

  _draw(analyser, data) {
    console.log(analyser, data);

    analyser.getByteFrequencyData(data);

    let self = this;
    let canvasCtx = self._canvasCtx;

    canvasCtx.clearRect(0, 0, this._WIDTH, this._WIDTH);
    let clock = -1;
    var states = getArrayWithLimitedLength(300);

    states.push(data.slice(0));

    states.forEach((e, i) => {
      canvasCtx.beginPath();
      e.forEach((f, index, array) => {
        // console.log(f,index,array.length);
        let x =
          300 +
          (200 + f / 10 + 2 * Math.sin(f / 116.1)) *
            Math.sin(f * 100 * 2 * Math.PI / array.length);
        let y =
          300 +
          (200 + f / 10 + 2 * Math.sin(f / 116.1)) *
            Math.cos(f * 100 * 2 * Math.PI / array.length);

        canvasCtx.lineTo(x, y);
      });
      canvasCtx.stroke();
    });
    // console.log(frequencyData);

    // canvasCtx.closePath();

    canvasCtx.strokeStyle = 'red';
    canvasCtx.stroke();

    window.requestAnimationFrame(self._draw);
  }
}
