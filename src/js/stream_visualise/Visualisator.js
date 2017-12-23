import * as THREE from 'three';
import './../lib/OrbitControlls';
import { WIDTH, HEIGHT, BODY, PLAY, STOP } from './../common/_constants';

class Visualizator {
  constructor() {
    this.tracks = {};
    this.visualisation;

    // Rendering process
    this.scene;
    this.camera;
    this.renderer;
    this.controls;

    // Audio Proccesing
    this.javascriptNode;
    this.audioContext;
    this.sourceBuffer;
    this.bufferList = {};
    this.playingSounds = {};
    this.analyser;

    // default values
    this.defaultAudioUrl = {
      aso: '/data/audio/aso.mp3',
      mystery: '/data/audio/mystery.mp3'
    };
    this.soundOptions = {
      volume: 1
    };
    this.numberOfBars = 50;

    this.bars = [];
  }

  init() {
    let self = this;

    // Generate a ThreeJS Scene
    this.scene = new THREE.Scene();

    // Define the renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(WIDTH, HEIGHT);
    // append the renderer to the body
    BODY.appendChild(this.renderer.domElement);

    // Create and add camera
    this.camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 20000);
    this.camera.position.set(0, 45, 0);
    this.scene.add(this.camera);

    window.addEventListener(
      'resize',
      self._debounce(function() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        self.renderer.setSize(width, height);
        self.camera.updateProjectsionMatrix();
      }),
      500
    );

    // Set background color of the scene

    this.renderer.setClearColor(0x333f47, 1);

    // Create a light and add it to the scene
    const light = new THREE.PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    this.scene.add(light);
    //Add interation capability to the scene
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.createBars();
  }

  setupAudioProccesing() {
    let self = this;
    this._checkForSupport();

    self._addDefaultSound(self.defaultAudioUrl);
  }
  _checkForSupport() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.audioContext = new window.AudioContext();
      this.audioContext = window.audioContext;
    } catch (e) {
      console.log('No Web Audio API support');
    }
  }

  _addDefaultSound(trackUrlData) {
    let self = this;
    let url = trackUrlData['aso'];

    // Load buffer asynchronously
    request({
      url: url
    })
      .then(data => {
        return new Promise((resolve, reject) => {
          self.audioContext.decodeAudioData(
            data,

            function(buffer) {
              if (!buffer) {
                console.log('error decoding file data: ' + url);
                reject('errorko');
              }
              console.log(buffer);
              self.bufferList[url] = buffer;
              resolve(true);
            }
          );
        });
      })
      .then(status => {
        self._makeActiveDefaultBtn();
      })
      .catch(error => {
        console.error(error);
      });

    function request(obj) {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || 'GET', obj.url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
          // Asynchronously decode the
          // audio file data in xhr.response
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(xhr.statusText);
          }
        };

        xhr.onerror = () => {
          reject(xhr.statusText);
        };

        xhr.send(obj.body);
      });
    }
  }

  playDefaultSound() {
    this.play(this.soundOptions, 'aso', true);
  }

  _makeActiveDefaultBtn() {
    PLAY.classList.add('is-interactive');
    STOP.classList.add('is-interactive');
  }

  play(options, soundUrl, defaultSound) {
    let self = this;
    self.stopSound();
    let url;
    if (defaultSound) {
      url = self.defaultAudioUrl[soundUrl];
    } else {
      url = soundUrl;
    }

    let buffer = this.bufferList[url];

    this.soundOptions = {
      loop: true,
      volume: 0.1
    };

    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        this.soundOptions[i] = options[i];
      }
    }

    //Only play if it's loaded yet
    if (typeof buffer !== 'undefined') {
      let source = this.makeSource(buffer);
      source.loop = this.soundOptions.loop;
      source.start(0);

      if (!this.playingSounds.hasOwnProperty(url)) {
        this.playingSounds[url] = [];
      }
      this.playingSounds[url].push(source);
    }
  }

  makeSource(buffer) {
    // create source buffer
    let source = this.audioContext.createBufferSource();
    //create volume gain
    let gainNode = this.audioContext.createGain();
    // create anayser

    //create the javascript node
    let JSNOde = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.javascriptNode = JSNOde;
    console.log(JSNOde);
    let analyser = this.analyser();
    this.soundAnalyser = analyser;
    gainNode.gain.value = this.soundOptions.volume;
    this.audioContext.GainNode = gainNode;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(gainNode);
    JSNOde.connect(this.audioContext.destination);
    gainNode.connect(this.audioContext.destination);

    return source;
  }
  //create the bars required to show the visualization
  createBars() {
    let self = this;
    //iterate and create bars
    for (var i = 0; i < this.numberOfBars; i++) {
      //create a bar
      var barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

      //create a material
      var material = new THREE.MeshPhongMaterial({
        color: self._getRandomColor(),
        emissive: 0xc56262,
        specular: 0xffffff
      });

      //create the geometry and set the initial position
      this.bars[i] = new THREE.Mesh(barGeometry, material);
      this.bars[i].position.set(i - this.numberOfBars / 2, 0, 0);

      //add the created bar to the scene
      this.scene.add(this.bars[i]);
    }
  }

  //util method to get random colors to make stuff interesting
  _getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  analyser() {
    let self = this;
    let analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    let dataArray = new Uint8Array(analyser.frequencyBinCount);

    // let time = 1;

    //this is where we animates the bars
    this.javascriptNode.onaudioprocess = function() {
      // get the average for the first channel

      analyser.getByteFrequencyData(dataArray);

      //render the scene and update controls
      self.renderer.render(self.scene, self.camera);
      self.controls.update();

      var step = Math.round(dataArray.length / self.numberOfBars);

      //Iterate through the bars and scale the z axis
      for (var i = 0; i < self.numberOfBars; i++) {
        var value = dataArray[i * step] / 4;
        value = value < 1 ? 1 : value;
        self.bars[i].scale.z = value;
      }
    };
    return analyser;
  }

  stopSound() {
    let url = this.defaultAudioUrl['aso'];
    if (this.playingSounds.hasOwnProperty(url)) {
      for (let i in this.playingSounds[url]) {
        if (this.playingSounds[url].hasOwnProperty(i)) {
          this.playingSounds[url][i].stop();
        }
      }
    }
  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}

export default Visualizator;
