import * as THREE from 'three';
import './../lib/OrbitControlls';
import { PLAY, STOP } from './../common/_constants';

class Visualizator {
  constructor() {
    this.tracks = {};
    // this.objectPath = path;

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

    this.numberOfBars = 44;

    this.bars = [];
  }

  _makeActiveDefaultBtn() {
    PLAY.classList.add('is-interactive');
    STOP.classList.add('is-interactive');
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
}

export default Visualizator;
