import Visualisator from './Visualisator';
import * as THREE from 'three';
import { WIDTH, HEIGHT, BODY } from './../common/_constants';
import { debounce } from './../helpers/_debounce';
import { Perlin } from './../helpers/Perlin';
export default class Sparky extends Visualisator {
  constructor() {
    //Rendering

    super();
  }

  init() {
    this._createScene();
    this._loadSound();
    // console.log(this.objectPath);
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

    window.addEventListener(
      'resize',
      debounce(function() {
        let width = window.innerWidth;
        let height = window.innerHeight;

        self.renderer.setSize(width, height);
        self.camera.updateProjectsionMatrix();
      }, 500)
    );

    // Set background color of the scene
    this.renderer.setClearColor(0x000000, 1);

    const light = new THREE.AmbientLight(0xffffff);
    // light.position.set(-100, 100, 100);
    this.scene.add(light);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.1);
    light1.position.set(-100, 100, 100);
    this.scene.add(light1);

    // const light2 = new THREE.DirectionalLight(0xffffff, 0.1);
    // light2.position.set(100, -100, 100);
    // this.scene.add(light2);

    // const light3 = new THREE.DirectionalLight(0xffffff, 0.1);
    // light3.position.set(100, 100, -100);
    // this.scene.add(light3);

    // const light2 = new THREE.PointLight(0xffffff);
    // light2.position.set(100, 100, -100);
    // this.scene.add(light2);

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

    this.time++;
    //render the scene and update controls

    // let step = Math.round(dataArray.length / self.numberOfBars);

    // Set to true if the faces array has been updated.
    this.geometry.elementsNeedUpdate = true;
    //   Set to true if the normals array has been updated.
    this.geometry.normalsNeedUpdate = true;
    // Set to true if the vertices array has been updated.
    this.geometry.verticesNeedUpdate = true;
    this.sphereObject.rotation.x = 90;
    this.sphereObject.rotation.y =
      this.time / 500 +
      Math.cos(
        Perlin(this.time / 500, this.time * 4 / 500, this.time * 3 / 500)
      );

    (function glitchObject() {
      dataArray.forEach((dataSet, dataSetIndex) => {
        // let particleColor = faces[dataSetIndex].color;

        if (dataSet !== 0) {
          let random =
            Perlin(255 / dataSet, 255 * 4 / dataSet, 255 * 3 / dataSet) * 10;

          self.particleFaces[dataSetIndex].color.setRGB(
            random / 2,
            random / 7,
            random / 9
          );
        } else if (dataSet === 0) {
          let random =
            Perlin(
              dataSetIndex / 100,
              dataSetIndex * 2 / 100,
              dataSetIndex * 3 / 100
            ) * 10;
          // console.log(face);
          // console.log((Math.random() * 10, Math.random() * 10, Math.random() * 10));

          self.particleFaces[dataSetIndex].color.setRGB(
            random / 4,
            random / 2,
            random * 2
          );
        }
        // console.log(self.particleFaces[dataSetIndex]);
        // self.particleFaces[dataSetIndex].vertices
      });
    })();

    self.renderer.render(self.scene, self.camera);
    self.controls.update();
    // this.particles.forEach(part => {
    //   part.vertexNormals.forEach(normal=> {
    //       normal.z+=
    //   });
    //   part.z = Perlin(
    //     this.time / 500,
    //     this.time * 4 / 500,
    //     this.time * 3 / 500
    //   );
    // });

    //Iterate through the bars and scale the z axis
    // for (let i = 0; i < self.numberOfBars; i++) {
    //   let value = dataArray[i * step] / 4;
    //   value = value < 1 ? 1 : value;
    //   self.sphereObject.scale.z = value;

    //   // self.sphereObject.scale.x = value;
    // }
  }
  createObject() {
    // console.log(this);
    let self = this;
    //iterate and create bars

    //create a bar
    // console.log(self);

    // console.log(self.scene);
    let sphereGeometry = new THREE.SphereGeometry(5, 13, 13);
    this.geometry = sphereGeometry;

    //create a material
    let material = new THREE.MeshPhysicalMaterial({
      color: 0xc59962,
      // emissive: 0xc59962
      // specular: 0xffffff
      vertexColors: THREE.FaceColors,

      overdraw: true
    });

    //create the geometry and set the initial position
    this.sphereObject = new THREE.Mesh(sphereGeometry, material);
    // this.sphereObject.position.set(i - this.numberOfBars / 2, 0, 0);
    this.sphereObject.position.set(0, 0, 0);

    let faces = this.sphereObject.geometry.faces;
    this.particleFaces = faces;
    // console.log(this.particleFaces);
    faces.forEach((face, index) => {
      let random = Perlin(index / 100, index * 2 / 100, index * 3 / 100) * 10;
      // console.log(face);
      // console.log((Math.random() * 10, Math.random() * 10, Math.random() * 10));
      // face.normal.z += 100;

      face.color.setRGB(random / 4, random / 2, random * 2);
    });

    // self.sphereObject.rotation.x = 10 * Math.cos());
    // self.sphereObject.rotation.y = 10 * Math.sin());
    // self.sphereObject.scale.y = 2;

    // this.bars.rotate;
    //add the created bar to the scene
    this.scene.add(this.sphereObject);
    // console.log(this.bars);
  }
}
