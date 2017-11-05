

import  {getArrayWithLimitedLength} from './lib/helpers';
var canvas = document.getElementById('canvas');


var btnPlayAudio = document.querySelector('#playAudio'),
  btnStopAudio = document.querySelector('#stopAudio'),
  volumeRegulation = document.querySelector('#volumeRegulation');

    
let WIDTH = 800;
let HEIGHT = 800;
var canvasCtx = canvas.getContext('2d');
canvasCtx.fillStyle = 'rgb(0, 0, 0)';
canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);




document.addEventListener('DOMContentLoaded', function() {


  var btnPlayAudio = document.querySelector('#playAudio'),
    btnStopAudio = document.querySelector('#stopAudio'),
    volumeRegulation = document.querySelector('#volumeRegulation');
  // console.log(volumeRegulation);



  try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new window.AudioContext();
  } catch (e) {
    console.log('No Web Audio API support');
  }


  var WebAudioAPISoundManager = function(context) {
    this.context = context;
    this.bufferList = {};
    this.playingSounds = {};
  };

  WebAudioAPISoundManager.prototype = {

    addSound: function(url) {

      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      var self = this;

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
    },

    stopSoundWithUrl: function(url) {
      if (this.playingSounds.hasOwnProperty(url)) {
        for (var i in this.playingSounds[url]) {
          if (this.playingSounds[url].hasOwnProperty(i)) {
            this.playingSounds[url][i].stop();
          }
        }
      }
    }

  };


  var WebAudioAPISound = function(url) {
    this.url = url + '.mp3';
    window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
    this.manager = window.webAudioAPISoundManager;
    this.manager.addSound(this.url);
  };


  WebAudioAPISound.prototype = {

    play: function(options) {
      var buffer = this.manager.bufferList[this.url];

      this.settings = {
        loop: true,
        volume: 0.1
      };

      for (var i in options) {
        if (options.hasOwnProperty(i)) {
          this.settings[i] = options[i];
        }
      }

      //Only play if it's loaded yet
      if (typeof buffer !== 'undefined') {
        var source = this.makeSource(buffer);
        source.loop = this.settings.loop;
        source.start(0);

        if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
          this.manager.playingSounds[this.url] = [];
        }
        this.manager.playingSounds[this.url].push(source);
      }
    },

    stop: function() {
      this.manager.stopSoundWithUrl(this.url);
    },

    makeSource: function(buffer) {
      // console.log(this);
      var source = this.manager.context.createBufferSource();
      var gainNode = this.manager.context.createGain();
      let analyser = this.analyser(this);
      gainNode.gain.value = this.settings.volume;
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(this.manager.context.destination);
      return source;
    },

    changeVolume: function(element) {
      console.log(element);
      var volume = element.value;

      var fraction = parseInt(element.value) / parseInt(element.max);
      // Let's use an x*x curve (x-squared) since simple linear (x) does not
      // sound as good.
      this.gainNode.gain.value = fraction * fraction;
    },

    analyser: function(buffer) {


      let analyser = this.manager.context.createAnalyser();

      // console.log(analyser);

      analyser.fftSize = 256;

      var bufferLength = analyser.frequencyBinCount;
      // console.log(bufferLength);
      var frequencyData = new Uint8Array(bufferLength);


      analyser.getByteTimeDomainData(frequencyData);



      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);


      function draw() {


        // let time = 0;
        // time++;
       
        canvasCtx.clearRect(0, 0,WIDTH, WIDTH);
        let clock = -1;
        var states = getArrayWithLimitedLength(300);
      
        analyser.getByteFrequencyData(frequencyData);

        states.push(frequencyData.slice(0)); 





        states.forEach((e,i) => {
          canvasCtx.beginPath();
          e.forEach((f,index,array) => {
            // console.log(f,index,array.length);
            let x = 300 + (200+f/10+2*Math.sin(f/116.1))*Math.sin((f*100)*2*Math.PI/array.length);
            let y = 300 + (200+f/10+2*Math.sin(f/116.1))*Math.cos((f*100)*2*Math.PI/array.length);

            canvasCtx.lineTo(x, y);
          });
          canvasCtx.stroke();
        });
        // console.log(frequencyData);
        

        // canvasCtx.closePath();
  
        canvasCtx.strokeStyle='red';
        canvasCtx.stroke();
        // canvasCtx.fillStyle = colorFill
        // canvasCtx.fill();

 
        // canvasCtx.stroke();
        


        // for (var i = 0; i < states; i++) {

        //   canvasCtx.beginPath();

        //   for (let j = 0; j < 880; j++) {

        //     let x = 300 + (-9*i + 10 + 2 * Math.sin(i*2 + j/6.1))*Math.sin(j*2*Math.PI/880 + clock*time/900 + i*2000);
        //     let y = 300 + (-9*i + 10 + 2*Math.sin(i*2 + j/6.1))*Math.cos(j*2*Math.PI/880 + clock*time/900 + i*2000);

        //     canvasCtx.lineTo(x, y);
        //   }

        //   canvasCtx.closePath();
        //   let colorFill = '';

        //   colorFill = (i % 2) ? ('#aaaFFF') : ('#ffFF00');
        //   canvasCtx.strokeStyle='red';
        //   canvasCtx.stroke();
        //   // canvasCtx.fillStyle = colorFill
        //   // canvasCtx.fill();




  
        // }


        window.requestAnimationFrame(draw);


      };





      draw();
      return analyser;

    }









  };


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

});





