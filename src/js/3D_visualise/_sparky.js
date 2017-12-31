import Visualisator from './Visualisator';
import * as THREE from 'three';
import { WIDTH, HEIGHT, BODY, DROPAREA } from './../common/_constants';
import { debounce } from './../helpers/_debounce';
import { Perlin } from './../helpers/Perlin';

// load canvas detecor for catching exceptions
import { Detector } from './../helpers/Detector';

// load fps statistic for checking memory licks
import { Stats } from './../lib/_stats.min.js';

export default class Sparky extends Visualisator {
  constructor() {
    //Rendering
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    super();
    this.sphere = {
      Object: [],
      settings: {
        radius: 200,
        segments: 4,
        rings: 128
      }
    };
  }

  init() {
    this._createScene();
    this._prepareSound();
    this._bindEvents();
    // console.log(this.objectPath);
  }
  get _defaultSound() {
    return this.defaultAudioUrl['why'];
  }

  _bindEvents() {
    this._onresize();
    this._handleDrop();
  }

  _onresize() {
    let self = this;
    window.addEventListener(
      'resize',
      debounce(function() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        self.camera.aspect = width / height;
        self.renderer.setSize(width, height);
        self.camera.updateProjectionMatrix();
      }, 500)
    );
  }

  _createScene() {
    let self = this;
    // console.log(this.analyser);
    // Generate a ThreeJS Scene
    this.scene = new THREE.Scene();

    // Define the renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(WIDTH, HEIGHT);
    // append the renderer to the body
    BODY.appendChild(this.renderer.domElement);

    // Create and add camera
    this.camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 1000);
    this.camera.position.set(0, 0, 40);

    this.scene.add(this.camera);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Set background color of the scene
    this.renderer.setClearColor(0x050505, 1);

    //Add interation capability to the scene
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.createObject();
    this._drawInitial();
    this.sound;
  }

  _prepareSound() {
    // create an AudioListener and add it to the camera
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    // create an Audio source
    this.sound = new THREE.PositionalAudio(this.listener);
  }

  loadSound(inputSound) {
    let self = this;
    let soundSource = inputSound || self._defaultSound;

    if (this.sound.isPlaying) {
      console.log(true);
      self.sound.stop();
    }

    // create an Audio source
    this.sound = new THREE.PositionalAudio(this.listener);

    // load a sound and set it as the Audio object's buffer
    let audioLoader = new THREE.AudioLoader();
    // console.log(soundSource);
    self._makePassiveDefaultBtn();

    audioLoader.load(soundSource, function(buffer) {
      self.sound.setBuffer(buffer);
      self.sound.setLoop(true);
      self.sound.setVolume(0.4);
      self.sound.setRefDistance(20);
      self._makeActiveDefaultBtn();
      self.sound.pause();
      // sound.play();
    });

    const sphere = new THREE.SphereGeometry(4.5, 50, 25);
    // const light = new THREE.PointLight(0x05ff40, 10, 0);
    const lightMesh = new THREE.Mesh(
      sphere,
      new THREE.MeshBasicMaterial({
        color: 0x05ff40
      })
    );

    lightMesh.add(self.sound);
    // light.position.set(0, 0, 0);
    this.scene.add(lightMesh);
    // create an AudioAnalyser, passing in the sound and desired fftSize
    self.analyser = new THREE.AudioAnalyser(this.sound, 1024);
  }

  audioProccesing() {
    this.sound.play();

    this._drawSound();
  }

  _handleDrop() {
    let self = this;
    //drag Enter
    DROPAREA.addEventListener(
      'dragenter',
      function(e) {
        e.currentTarget.classList.add('is-dragenter');
      },
      false
    );

    //drag over
    DROPAREA.addEventListener(
      'dragover',
      function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      },
      false
    );

    //drag leave
    DROPAREA.addEventListener(
      'dragleave',
      function(e) {
        e.currentTarget.classList.remove('is-dragenter');
      },
      false
    );

    //drop
    DROPAREA.addEventListener(
      'drop',
      function(e) {
        e.stopPropagation();

        e.preventDefault();
        e.currentTarget.classList.remove('is-dragenter');

        self._makePassiveDefaultBtn();

        //get the file
        const file = e.dataTransfer.files[0];

        const fileReader = new FileReader();

        fileReader.onload = function(e) {
          const fileResult = e.target.result;
          self.loadSound(fileResult);
        };

        fileReader.onerror = function(e) {
          debugger;
        };

        if (file.type === 'audio/mpeg' || 'audio/mp3') {
          console.log(file.type, 'da');
          fileReader.readAsDataURL(file);
        } else {
          console.log(file.type, 'abort');
          fileReader.abort();
        }
      },
      false
    );
  }
  _drawSound() {
    let self = this;
    (function drawSomeVisualisation() {
      window.requestAnimationFrame(drawSomeVisualisation);
      self.frequencyData = self.analyser.getFrequencyData();
      // console.log(self.frequencyData);
      self._render(self.frequencyData);
      self.animationStatistic.update();
    })();
  }

  _drawInitial() {
    let self = this;
    (function drawSomeVisualisation() {
      window.requestAnimationFrame(drawSomeVisualisation);
      self._render();
      self.animationStatistic.update();
    })();
  }

  _render(dataArray) {
    let self = this;

    // this.time++;

    let time = Date.now() * 0.01;

    this.sphere.Object.rotation.y = this.sphere.Object.rotation.z = 0.01 * time;
    this.uniforms.amplitude.value =
      2.5 * Math.sin(this.sphere.Object.rotation.y * 0.125);
    this.uniforms.color.value.offsetHSL(0.0005, 0, 0);

    this.geometryDynamic.attributes.displacement.needsUpdate = true;
    this.renderer.render(self.scene, self.camera);
    this.controls.update();

    // add vibrations

    if (dataArray) {
      const dataLength = dataArray.length;
      for (var i = 0; i < dataLength; i++) {
        self.displacement[i] = dataArray[i] / 50;
        self.displacement[2 * i] = dataArray[i] / 50;
        self.displacement[3 * i] = dataArray[i] / 50;
      }
    }
  }
  createObject() {
    // console.log(this);
    let self = this;
    //iterate and create bars

    // Setup dynamic layer of visualisation
    this.uniforms = {
      amplitude: {
        value: 1
      },
      color: {
        value: new THREE.Color(0xff2200)
      },
      texture: {
        value: new THREE.TextureLoader().load('img/water.jpg')
      }
    };

    this.uniforms.texture.value.wrapS = this.uniforms.texture.value.wrapT =
      THREE.RepeatWrapping;

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      side: THREE.DoubleSide
    });

    this.materialDynamic = shaderMaterial;
    // console.log(self.scene);
    let AuraGeometry = new THREE.IcosahedronBufferGeometry(5, 2);

    this.geometryDynamic = AuraGeometry;

    //create the geometry and set the initial position
    this.sphere.Object = new THREE.Mesh(
      this.geometryDynamic,
      this.materialDynamic
    );
    // this.sphereObject.position.set(i - this.numberOfBars / 2, 0, 0);
    this.sphere.Object.position.set(0, 0, 0);

    this.displacement = new Float32Array(
      self.geometryDynamic.attributes.position.count
    );

    this.geometryDynamic.addAttribute(
      'displacement',
      new THREE.BufferAttribute(self.displacement, 1)
    );

    //create the geometry and set the initial position
    this.sphere.Object = new THREE.Mesh(
      this.geometryDynamic,
      this.materialDynamic
    );

    this.scene.add(this.sphere.Object);

    this.animationStatistic = new Stats();

    document.body.appendChild(this.animationStatistic.dom);
  }
}
