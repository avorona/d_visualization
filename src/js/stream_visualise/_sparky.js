import Visualisator from './Visualisator';
import * as THREE from 'three';
import { WIDTH, HEIGHT, BODY } from './../common/_constants';
import { debounce } from './../helpers/_debounce';

export default class Sparky extends Visualisator {
  constructor() {
    //Rendering
    super();
  }

  init() {
    this._createScene();
    this._loadSound();
    // this.visualiseSound();
  }
  _createScene() {
    // console.log(this.analyser);
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
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    window.addEventListener(
      'resize',
      debounce(function() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        self.renderer.setSize(width, height);
        self.camera.updateProjectsionMatrix();
      }),
      500
    );

    // Set background color of the scene

    this.renderer.setClearColor(0x000000, 1);

    // Create a light and add it to the scene
    const light = new THREE.PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    this.scene.add(light);
    //Add interation capability to the scene
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.createObject();
  }

  _loadSound() {
    let self = this;
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    this.camera.add(listener);

    // create an Audio source
    this.sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load(self.defaultAudioUrl['aso'], function(buffer) {
      self.sound.setBuffer(buffer);
      self.sound.setLoop(true);
      self.sound.setVolume(0.1);
      self._makeActiveDefaultBtn();
      // sound.play();
    });

    // create an AudioAnalyser, passing in the sound and desired fftSize
    self.analyser = new THREE.AudioAnalyser(this.sound, 512);
  }

  audioProccesing() {
    let self = this;
    this.sound.play();
    draw();

    function draw() {
      window.requestAnimationFrame(draw);

      // self.analyser.getByteTimeDomainData(self.frequencyData);

      self.frequencyData = self.analyser.getFrequencyData();

      self._render(self.frequencyData);
    }
  }
  _render(dataArray) {
    let self = this;
    // get the average for the first channel

    // get the average frequency of the sound

    //render the scene and update controls
    self.renderer.render(self.scene, self.camera);
    self.controls.update();

    var step = Math.round(dataArray.length / self.numberOfBars);

    //Iterate through the bars and scale the z axis
    for (var i = 0; i < self.numberOfBars; i++) {
      var value = dataArray[i * step] / 4;
      value = value < 1 ? 1 : value;
      self.bars[i].scale.z = value;

      // self.bars[i].scale.x = value;
    }
  }
  createObject() {
    // console.log(this);
    let self = this;
    //iterate and create bars
    for (var i = 0; i < this.numberOfBars; i++) {
      //create a bar
      // console.log(self);
      var barGeometry = new THREE.SphereGeometry(0.5, 10, 12);

      //create a material
      var material = new THREE.MeshPhongMaterial({
        color: self._getRandomColor(),
        emissive: 0xc59962,
        specular: 0xffffff
      });

      //create the geometry and set the initial position
      this.bars[i] = new THREE.Mesh(barGeometry, material);
      // this.bars[i].position.set(i - this.numberOfBars / 2, 0, 0);
      this.bars[i].position.set(10 * Math.cos(i), 10 * Math.sin(i), 0);

      self.bars[i].rotation.x = 10 * Math.cos(-(Math.PI / i));
      self.bars[i].rotation.y = 10 * Math.sin(-(Math.PI / i));
      self.bars[i].scale.y = 2;

      // this.bars.rotate;
      //add the created bar to the scene
      this.scene.add(this.bars[i]);
      // console.log(this.bars);
    }
  }
}
