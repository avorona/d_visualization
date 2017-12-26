import Visualisator from './Visualisator';
import * as THREE from 'three';
import {
  WIDTH,
  HEIGHT,
  BODY
} from './../common/_constants';
import {
  debounce
} from './../helpers/_debounce';
import {
  Perlin
} from './../helpers/Perlin';

// load canvas detecor for catching exceptions
import {
  Detector
} from './../helpers/Detector';

// load fps statistic for checking memory licks
import {
  Stats
} from './../lib/_stats.min.js';

export default class Sparky extends Visualisator {
  constructor() {
    //Rendering
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    super();
    this.sphere = {
      Object: [],
      settings: {
        radius: 50,
        segments: 128,
        rings: 64
      }
    };
  }

  init() {
    this._createScene();
    this._loadSound();
    this._bindEvents();
    // console.log(this.objectPath);
  }

  _bindEvents() {
    this._onresize();
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
    this.camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 2000);
    this.camera.position.set(0, 0, 100);

    this.scene.add(this.camera);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Set background color of the scene
    this.renderer.setClearColor(0x050505, 1);

    const light = new THREE.AmbientLight(0xffffff);
    // light.position.set(-100, 100, 100);
    this.scene.add(light);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.1);
    light1.position.set(-100, 100, 100);
    this.scene.add(light1);

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
    let listener = new THREE.AudioListener();
    this.camera.add(listener);

    // create an Audio source
    this.sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    let audioLoader = new THREE.AudioLoader();

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
    this.time = 0;

    function draw() {
      window.requestAnimationFrame(draw);

      // self.analyser.getByteTimeDomainData(self.frequencyData);

      self.frequencyData = self.analyser.getFrequencyData();
      // console.log(self.frequencyData);
      self._render(self.frequencyData);
    }
  }
  _render(dataArray) {
    let self = this;

    // this.time++;

    let time = Date.now() * 0.01;

    this.sphere.Object.rotation.y = this.sphere.Object.rotation.z = 0.01 * time;
    this.uniforms.amplitude.value =
      2.5 * Math.sin(this.sphere.Object.rotation.y * 0.125);
    this.uniforms.color.value.offsetHSL(0.0005, 0, 0);
    for (var i = 0; i < dataArray.length; i++) {
      self.displacement[i] = dataArray[i];
      self.noise[i] += 0.5 * (0.5 - Math.random());
      self.noise[i] = THREE.Math.clamp(self.noise[i], -5, 5);
      self.displacement[i] += self.noise[i];
    }

    this.geometry.attributes.displacement.needsUpdate = true;
    this.renderer.render(self.scene, self.camera);
    //render the scene and update controls

    // let step = Math.round(dataArray.length / self.numberOfBars);

    // Set to true if the faces array has been updated.
    // this.geometry.elementsNeedUpdate = true;
    // //   Set to true if the normals array has been updated.
    // this.geometry.normalsNeedUpdate = true;
    // // Set to true if the vertices array has been updated.
    // this.geometry.verticesNeedUpdate = true;
    // this.sphere.Object.rotation.x = 90;
    // this.sphere.Object.rotation.y =
    //   this.time / 500 +
    //   Math.cos(
    //     Perlin(this.time / 500, this.time * 4 / 500, this.time * 3 / 500)
    //   );

    // (function glitchObject() {

    //   dataArray.forEach((dataSet, dataSetIndex) => {
    //     // let particleColor = faces[dataSetIndex].color;

    //     if (dataSet !== 0) {
    //       let random =
    //         Perlin(255 / dataSet, 255 * 4 / dataSet, 255 * 3 / dataSet) * 10;

    //       self.particleFaces[dataSetIndex].color.setRGB(
    //         random / 2,
    //         random / 7,
    //         random / 9
    //       );
    //     } else if (dataSet === 0) {
    //       let random =
    //         Perlin(
    //           dataSetIndex / 100,
    //           dataSetIndex * 2 / 100,
    //           dataSetIndex * 3 / 100
    //         ) * 10;
    //       // console.log(face);
    //       // console.log((Math.random() * 10, Math.random() * 10, Math.random() * 10));

    //       self.particleFaces[dataSetIndex].color.setRGB(
    //         random / 4,
    //         random / 2,
    //         random * 2
    //       );
    //     }
    //     // console.log(self.particleFaces[dataSetIndex]);
    //     // self.particleFaces[dataSetIndex].vertices
    //   });
    // })();

    self.renderer.render(self.scene, self.camera);
    self.controls.update();
  }
  createObject() {
    // console.log(this);
    let self = this;
    //iterate and create bars

    //create a bar
    // console.log(self);

    //create a material
    // Set the uniforms shader props
    this.uniforms = {
      amplitude: {
        value: 1.0
      },
      color: {
        value: new THREE.Color(0xff2200)
      },
      texture: {
        value: new THREE.TextureLoader().load('/img/water.jpg')
      }
    };
    this.uniforms.texture.value.wrapS = this.uniforms.texture.value.wrapT =
      THREE.RepeatWrapping;

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent
    });

    this.material = shaderMaterial;
    // console.log(self.scene);
    let sphereGeometry = new THREE.SphereBufferGeometry(
      self.sphere.radius,
      self.sphere.segments,
      self.sphere.rings
    );

    this.geometry = sphereGeometry;

    //create the geometry and set the initial position
    this.sphere.Object = new THREE.Mesh(this.geometry, this.material);
    // this.sphereObject.position.set(i - this.numberOfBars / 2, 0, 0);
    this.sphere.Object.position.set(0, 0, 0);

    this.displacement = new Float32Array(
      self.geometry.attributes.position.count
    );
    this.noise = new Float32Array(self.geometry.attributes.position.count);
    for (var i = 0; i < self.displacement.length; i++) {
      self.noise[i] = Math.random() * 5;
    }
    this.geometry.addAttribute(
      'displacement',
      new THREE.BufferAttribute(self.displacement, 1)
    );

    //create the geometry and set the initial position
    this.sphere.Object = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.sphere.Object);

    let stats = new Stats();
    document.body.appendChild(stats.dom);
  }
}
