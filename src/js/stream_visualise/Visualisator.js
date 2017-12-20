import * as THREE from 'three';
import { WIDTH, HEIGHT, BODY } from './../common/_constants';
class Visualizator {
  constructor() {
    this.tracks = {};
    this.visualisation;
    this.scene;
    this.camera;
    this.renderer;
    this.controls;
  }

  init() {
    let self = this;

    // Generate a ThreeJS Scene
    this.scene = new THREE.Scene();

    // Define the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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
