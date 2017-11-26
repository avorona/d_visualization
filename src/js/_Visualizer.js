import PubSub from 'pubsub-js';

class Visualiser {


  constructor() {

    this._canvas = document.getElementById('canvas');
    this._WIDTH = 800;
    this._HEIGHT=800;
    this.canvasCtx = this._canvas.getContext('2d');


    this._init();
  }

  _init() {

    this._createCanvas();

  }

  _createCanvas() {

    this._canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this._canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    this._subscribeForData();

    
  }


  _subscribeForData() {

    this._canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    this._draw();

  }


  _draw() {

    let self=this;
    
    canvasCtx.clearRect(0, 0, WIDTH, WIDTH);
    let clock = -1;
    var states = getArrayWithLimitedLength(300);

    analyser.getByteFrequencyData(frequencyData);

    states.push(frequencyData.slice(0));


    states.forEach((e, i) => {
      canvasCtx.beginPath();
      e.forEach((f, index, array) => {
        // console.log(f,index,array.length);
        let x = 300 + (200 + f / 10 + 2 * Math.sin(f / 116.1)) * Math.sin((f * 100) * 2 * Math.PI / array.length);
        let y = 300 + (200 + f / 10 + 2 * Math.sin(f / 116.1)) * Math.cos((f * 100) * 2 * Math.PI / array.length);

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
